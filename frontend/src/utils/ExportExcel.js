// utils/ExportExcel.js
import React from "react";
import { useTableContext } from "../contexts/TableContext"; // kendi dosya yolunuza göre düzenleyin
import * as XLSX from "xlsx";
import { RiFileExcel2Line } from "react-icons/ri";

export default function ExportExcel({ fileName = "Export.xlsx" }) {
  const { data, columns } = useTableContext();

  // Excel’e aktarılacak veriye dönüştürme
  const transformDataForExcel = () => {
    if (!data || data.length === 0) return [];

    // actions key’ini dışarıda bırakıyoruz, kalanı "label" -> "value" eşlemesi
    return data.map((row) => {
      const newObj = {};
      columns.forEach((col) => {
        if (col.key !== "actions") {
          newObj[col.label] = row[col.key];
        }
      });
      return newObj;
    });
  };

  const handleExport = () => {
    // Data
    const excelData = transformDataForExcel();

    if (excelData.length === 0) {
      alert("Dışa aktarılacak veri yok!");
      return;
    }

    // 1) JSON -> Worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // 2) Worksheet’e (örneğin) kolon genişlikleri ekleme
    // "wch" (width in characters) değeriyle yaklaşık kolon genişliği ayarlayabiliriz
    // columns uzunluğunda bir dizi oluşturup, istediğiniz genişlik değerlerini girebilirsiniz
    const wsCols = columns
      .filter((col) => col.key !== "actions")
      .map(() => ({ wch: 20 })); // Tüm kolonlara 20 karakter genişlik
    worksheet["!cols"] = wsCols;

    // 3) Çalışma alanının (sheet) aralığını buluyoruz
    // Örn. A1'den E10'a kadarsa, orada gezinerek stil atayabiliriz
    const range = XLSX.utils.decode_range(worksheet["!ref"]);

    // 4) Header (ilk satır) hücre stilleri
    // (Örn. kalın metin, gri arka plan, ortalama vb.)
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFFFF" } }, // beyaz font
      fill: { fgColor: { rgb: "FF4F81BD" } }, // koyu mavi/ gri arkaplan
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

    // 5) Veri hücreleri için (1. satır haricindeki hücreler) temel border ekleyelim
    // Dilerseniz aynı şekilde arkaplan rengi vb. de ayarlayabilirsiniz
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

    // 6) Workbook yarat, Worksheet'i ekle, yazdır
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
