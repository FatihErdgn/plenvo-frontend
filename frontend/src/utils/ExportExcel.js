// utils/ExportExcel.js
import React from "react";
import { useTableContext } from "../contexts/TableContext"; // Kendi dosya yolunuza göre düzenleyin
import * as XLSX from "xlsx";
import { RiFileExcel2Line } from "react-icons/ri";

export default function ExportExcel({ fileName = "Export.xlsx" }) {
  const { data, excelColumns } = useTableContext();

  // Excel’e aktarılacak veriyi dönüştürme:
  // Önce her sütun için, getValue varsa onu, yoksa renderCell varsa onu çalıştırıp değeri alıyoruz.
  const transformDataForExcel = () => {
    if (!data || data.length === 0) return [];
    return data.map((row) => {
      const newObj = {};
      excelColumns.forEach((col) => {
        if (col.key !== "actions") {
          let value = "";
          if (typeof col.getValue === "function") {
            value = col.getValue(row);
          } else if (typeof col.renderCell === "function") {
            const rendered = col.renderCell(row);
            if (typeof rendered === "string" || typeof rendered === "number") {
              value = rendered.toString();
            } else if (React.isValidElement(rendered)) {
              const children = rendered.props.children;
              value = Array.isArray(children) ? children.join("") : children;
            } else {
              value = "";
            }
          } else {
            value = row[col.key] ?? "";
          }
          newObj[col.label] = value;
        }
      });
      return newObj;
    });
  };

  const handleExport = () => {
    // Excel verisini hazırlıyoruz
    const excelData = transformDataForExcel();

    if (excelData.length === 0) {
      alert("Dışa aktarılacak veri yok!");
      return;
    }

    // 1) JSON veriyi Worksheet'e dönüştürme
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // 2) Worksheet'e kolon genişlikleri ekleme (örneğin tüm kolonlara 20 karakter genişlik)
    const wsCols = excelColumns
      .filter((col) => col.key !== "actions")
      .map(() => ({ wch: 20 }));
    worksheet["!cols"] = wsCols;

    // 3) Worksheet'in veri aralığını alıyoruz
    const range = XLSX.utils.decode_range(worksheet["!ref"]);

    // 4) Header (ilk satır) hücre stillerini ayarlıyoruz
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFFFF" } },
      fill: { fgColor: { rgb: "FF4F81BD" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "FFFFFFFF" } },
        bottom: { style: "thin", color: { rgb: "FFFFFFFF" } },
        left: { style: "thin", color: { rgb: "FFFFFFFF" } },
        right: { style: "thin", color: { rgb: "FFFFFFFF" } },
      },
    };

    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = headerStyle;
      }
    }

    // 5) Veri hücreleri için temel stil (border vb.) ekleme
    const bodyStyle = {
      border: {
        top: { style: "thin", color: { rgb: "FFAAAAAA" } },
        bottom: { style: "thin", color: { rgb: "FFAAAAAA" } },
        left: { style: "thin", color: { rgb: "FFAAAAAA" } },
        right: { style: "thin", color: { rgb: "FFAAAAAA" } },
      },
      alignment: { vertical: "center" },
    };

    for (let R = 1; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = bodyStyle;
        }
      }
    }

    // 6) Workbook oluşturma, Worksheet'i ekleme ve dosyayı yazdırma
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <button
      onClick={handleExport}
      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-700"
    >
      <RiFileExcel2Line className="w-6 h-6" />
    </button>
  );
}
