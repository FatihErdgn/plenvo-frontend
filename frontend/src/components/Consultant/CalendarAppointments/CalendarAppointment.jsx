import React, { useEffect, useState } from "react";
import {
  getCalendarAppointments,
  createCalendarAppointment,
  updateCalendarAppointment,
  deleteCalendarAppointment,
} from "../../../services/calendarAppointmentService";
import { getUsers, getProfile } from "../../../services/userService";

// Haftanın günleri
const DAYS = [
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
  "Pazar",
];
// Saat dilimleri
const TIME_SLOTS = [
  "09:00-09:50",
  "10:00-10:50",
  "11:00-11:50",
  "12:00-12:50",
  "13:00-13:50",
  "14:00-14:50",
  "15:00-15:50",
  "16:00-16:50",
  "17:00-17:50",
  "18:00-18:50",
  "19:00-19:50",
  "20:00-20:50",
];

// Yardımcı fonksiyon: Randevu id'sine göre pastel renk seçimi yapar.
const getPastelColor = (appointment) => {
  if (!appointment || !appointment._id) return "";
  const idStr = appointment._id.toString();
  let sum = 0;
  for (let i = 0; i < idStr.length; i++) {
    sum += idStr.charCodeAt(i);
  }
  const pastelColors = [
    "bg-blue-100",
    "bg-pink-100",
    "bg-purple-100",
    "bg-yellow-100",
    "bg-green-100",
    "bg-indigo-100",
    "bg-orange-100",
  ];
  return pastelColors[sum % pastelColors.length];
};

export default function CalendarSchedulePage() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [doctorList, setDoctorList] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [participantCount, setParticipantCount] = useState(1);
  const [participantNames, setParticipantNames] = useState([""]);
  // Yeni: Açıklama için state ekleyelim
  const [description, setDescription] = useState("");

  // Kullanıcı profilini al
  useEffect(() => {
    (async () => {
      const profileRes = await getProfile();
      if (profileRes.success) {
        setLoggedInUser(profileRes.user);
      }
    })();
  }, []);

  // Danışman listesini getir (admin/manager/superadmin ise)
  useEffect(() => {
    if (
      loggedInUser &&
      ["admin", "manager", "superadmin"].includes(loggedInUser.roleId?.roleName)
    ) {
      (async () => {
        const userRes = await getUsers();
        if (userRes.success) {
          const docs = userRes.data.filter(
            (u) => (u.roleId?.roleName === "doctor" || u.roleId?.roleName === "admin") && u.speciality.includes("Pilates")
          );
          setDoctorList(docs);
        }
      })();
    }
  }, [loggedInUser]);

  // Seçilen (veya kendi) doktora ait randevuları çek
  useEffect(() => {
    if (!loggedInUser) return;

    let doctorIdToFetch = "";
    if (loggedInUser.roleId?.roleName === "doctor") {
      doctorIdToFetch = loggedInUser._id;
    } else if (
      ["admin", "manager", "superadmin"].includes(loggedInUser.roleId?.roleName)
    ) {
      if (!selectedDoctor) return;
      doctorIdToFetch = selectedDoctor;
    }

    if (doctorIdToFetch) {
      (async () => {
        const res = await getCalendarAppointments(doctorIdToFetch);
        if (res.success) {
          setAppointments(res.data);
        }
      })();
    }
  }, [loggedInUser, selectedDoctor]);

  // Hücre tıklama - yeni randevu oluşturmak için
  const handleCellClick = (dayIndex, timeIndex) => {
    if (loggedInUser?.roleId?.roleName === "doctor") return; // Doktor ekleyemesin
    setEditMode(false);
    setSelectedAppointment({ dayIndex, timeIndex, participants: [] });
    setParticipantCount(1);
    setParticipantNames([""]);
    setDescription(""); // Yeni randevu için açıklamayı sıfırla
    setShowModal(true);
  };

  // Var olan randevuyu düzenlemek/silmek için
  const handleAppointmentClick = (appt) => {
    if (loggedInUser?.roleId?.roleName === "doctor") return;
    setEditMode(true);
    setSelectedAppointment(appt);
    setParticipantCount(appt.participants?.length || 1);
    setParticipantNames(appt.participants?.map((p) => p.name) || [""]);
    setDescription(appt.description || ""); // Varolan açıklamayı al
    setShowModal(true);
  };

  const handleParticipantCountChange = (count) => {
    setParticipantCount(count);
    const currentNames = [...participantNames];
    while (currentNames.length < count) {
      currentNames.push("");
    }
    currentNames.splice(count);
    setParticipantNames(currentNames);
  };

  // Kaydet
  const handleSubmit = async () => {
    if (!selectedAppointment) return;
    const doctorId =
      loggedInUser?.roleId?.roleName === "doctor"
        ? loggedInUser._id
        : selectedDoctor;

    const payload = {
      dayIndex: selectedAppointment.dayIndex,
      timeIndex: selectedAppointment.timeIndex,
      doctorId,
      participants: participantNames.map((name) => ({ name })),
      description, // Açıklama alanını payload'a ekledik
    };

    if (editMode) {
      const res = await updateCalendarAppointment(
        selectedAppointment._id,
        payload
      );
      if (res.success) {
        refreshAppointments(doctorId);
      }
    } else {
      const res = await createCalendarAppointment(payload);
      if (res.success) {
        refreshAppointments(doctorId);
      }
    }
    setShowModal(false);
  };

  // Sil
  const handleDelete = async () => {
    if (!selectedAppointment) return;
    const doctorId =
      loggedInUser?.roleId?.roleName === "doctor"
        ? loggedInUser._id
        : selectedDoctor;

    const res = await deleteCalendarAppointment(selectedAppointment._id);
    if (res.success) {
      refreshAppointments(doctorId);
    }
    setShowModal(false);
  };

  // Takvimi yenile
  const refreshAppointments = async (doctorId) => {
    const res = await getCalendarAppointments(doctorId);
    if (res.success) {
      setAppointments(res.data);
    }
  };

  // Hücredeki randevuyu bul
  const findAppointmentForCell = (dayIndex, timeIndex) => {
    return appointments.find(
      (appt) => appt.dayIndex === dayIndex && appt.timeIndex === timeIndex
    );
  };

  // Seçili doktor adını göster
  const getSelectedDoctorName = () => {
    if (!loggedInUser) return "Yükleniyor...";
    if (loggedInUser.roleId?.roleName === "doctor") {
      return `${loggedInUser.firstName} ${loggedInUser.lastName}`;
    } else if (
      ["admin", "manager", "superadmin"].includes(loggedInUser.roleId?.roleName)
    ) {
      const doc = doctorList.find((d) => d._id === selectedDoctor);
      return doc ? `${doc.firstName} ${doc.lastName}` : "Danışman Seçiniz";
    }
    return "Kullanıcı Rolü Tanımsız";
  };

  return (
    <div className="bg-[#f4f7fe] font-montserrat p-6 rounded-lg shadow-md w-full h-full bg-white">
      {/* Danışman seçimi (admin vb.) */}
      {loggedInUser?.roleId?.roleName !== "doctor" && (
        <div className="mb-4">
          <label className="mr-2 font-medium">Danışman Seç:</label>
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="border p-1 cursor-pointer rounded-md"
          >
            <option value="">Danışman Seçiniz</option>
            {doctorList.map((doc) => (
              <option key={doc._id} value={doc._id}>
                {doc.firstName} {doc.lastName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tabloyu saran container: max-h, overflow-auto */}
      <div className="max-h-[43.75rem] overflow-auto border rounded-lg">
        <table className="table-fixed w-full border-collapse border border-gray-300">
          <thead>
            {/* Danışman Adı */}
            <tr>
              <th
                colSpan={DAYS.length + 1}
                className="border border-gray-300 p-2 bg-[#007E85] text-white text-lg font-semibold text-center"
              >
                {getSelectedDoctorName()}
              </th>
            </tr>
            {/* Gün Başlıkları */}
            <tr>
              <th className="border border-gray-300 p-2 bg-gray-50 w-[15%]"></th>
              {DAYS.map((day, index) => (
                <th
                  key={index}
                  className="border border-gray-300 p-2 bg-gray-50 text-center w-[calc(85%/7)]"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((slot, timeIndex) => (
              <tr key={timeIndex}>
                {/* Saat Dilimi */}
                <td className="border border-gray-300 p-2 bg-[#F7F6FE] text-center font-medium">
                  {slot}
                </td>
                {/* Gün-Saat Hücreleri */}
                {DAYS.map((day, dayIndex) => {
                  const appt = findAppointmentForCell(dayIndex, timeIndex);
                  return (
                    <td
                      key={dayIndex}
                      onClick={() =>
                        appt
                          ? handleAppointmentClick(appt)
                          : handleCellClick(dayIndex, timeIndex)
                      }
                      className={`border border-gray-300 p-2 cursor-pointer align-top ${
                        appt ? getPastelColor(appt) : "bg-white"
                      }`}
                      title={
                        appt && appt.description
                          ? `Randevu Açıklaması: ${appt.description}`
                          : ""
                      }
                    >
                      {appt ? (
                        <div className="text-sm font-medium">
                          {appt.participants.map((p) => p.name).join(", ")}
                        </div>
                      ) : (
                        <div className="text-gray-400 italic">Boş</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Randevu Modalı */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded shadow-md w-96">
            <h2 className="text-xl font-bold mb-2">
              {editMode ? "Randevu Düzenle" : "Yeni Randevu Oluştur"}
            </h2>

            {/* Danışman Adı */}
            <div className="mb-2">
              <label className="block font-medium">Danışman</label>
              <input
                type="text"
                value={getSelectedDoctorName()}
                readOnly
                className="border p-1 w-full cursor-pointer rounded-md"
              />
            </div>

            {/* Açıklama Alanı */}
            <div className="mb-2">
              <label className="block font-medium">Açıklama</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border p-1 w-full cursor-pointer rounded-md resize-none"
                rows="3"
                placeholder="Randevu ile ilgili açıklama giriniz..."
              />
            </div>

            {/* Kişi Sayısı */}
            <div className="mb-2">
              <label className="block font-medium">Kişi Sayısı</label>
              <select
                value={participantCount}
                onChange={(e) =>
                  handleParticipantCountChange(parseInt(e.target.value))
                }
                className="border p-1 w-full cursor-pointer rounded-md"
              >
                {[1, 2, 3, 4, 5, 6].map((cnt) => (
                  <option key={cnt} value={cnt}>
                    {cnt}
                  </option>
                ))}
              </select>
            </div>

            {/* Kişi İsimleri */}
            {Array.from({ length: participantCount }, (_, i) => (
              <div key={i} className="mb-2">
                <label className="block text-sm font-medium">
                  Kişi {i + 1} Adı
                </label>
                <input
                  type="text"
                  value={participantNames[i] || ""}
                  onChange={(e) => {
                    const newNames = [...participantNames];
                    newNames[i] = e.target.value;
                    setParticipantNames(newNames);
                  }}
                  className="border p-1 w-full cursor-pointer rounded-md"
                />
              </div>
            ))}

            {/* Butonlar */}
            <div className="flex justify-end gap-2 mt-4">
              {editMode && (
                <button
                  onClick={handleDelete}
                  className="bg-red-500 text-white px-4 py-1 rounded"
                >
                  Sil
                </button>
              )}
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 px-4 py-1 rounded"
              >
                Vazgeç
              </button>
              {loggedInUser?.roleId?.roleName !== "doctor" && (
                <button
                  onClick={handleSubmit}
                  className="bg-[#007E85] text-white px-4 py-1 rounded"
                >
                  Kaydet
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
