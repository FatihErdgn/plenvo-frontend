import { useState, useEffect, useCallback } from 'react';
import {
  getCalendarAppointments,
  createCalendarAppointment,
  updateCalendarAppointment,
  deleteCalendarAppointment,
} from '../../../../services/calendarAppointmentService';
import { getUsers, getProfile } from '../../../../services/userService';

export const useAppointments = () => {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [doctorList, setDoctorList] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Kullanıcı profilini al
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileRes = await getProfile();
        if (profileRes.success) {
          setLoggedInUser(profileRes.user);
        }
      } catch (err) {
        setError('Profil bilgileri alınamadı');
      }
    };

    fetchProfile();
  }, []);

  // Danışman listesini getir
  useEffect(() => {
    const fetchDoctors = async () => {
      if (
        loggedInUser &&
        ["admin", "manager", "superadmin", "consultant"].includes(
          loggedInUser.roleId?.roleName
        )
      ) {
        try {
          const userRes = await getUsers();
          if (userRes.success) {
            const docs = userRes.data.filter(
              (u) =>
                u.roleId?.roleName === "doctor" || u.roleId?.roleName === "admin"
            );
            setDoctorList(docs);
          }
        } catch (err) {
          setError('Danışman listesi alınamadı');
        }
      }
    };

    fetchDoctors();
  }, [loggedInUser]);

  // Randevuları getir
  const fetchAppointments = useCallback(async (doctorId, weekStart) => {
    if (!doctorId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await getCalendarAppointments(doctorId, weekStart?.toISOString());
      if (res.success) {
        setAppointments(res.data);
      } else {
        setError('Randevular alınamadı');
      }
    } catch (err) {
      setError('Randevular alınırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  // Randevu oluştur
  const createAppointment = useCallback(async (payload) => {
    try {
      setLoading(true);
      const res = await createCalendarAppointment(payload);
      if (res.success) {
        return { success: true, data: res.data };
      } else {
        throw new Error(res.message || 'Randevu oluşturulamadı');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Randevu oluşturulurken bir hata oluştu';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Randevu güncelle
  const updateAppointment = useCallback(async (appointmentId, payload) => {
    try {
      setLoading(true);
      const res = await updateCalendarAppointment(appointmentId, payload);
      if (res.success) {
        return { success: true, data: res.data };
      } else {
        throw new Error(res.message || 'Randevu güncellenemedi');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Randevu güncellenirken bir hata oluştu';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Randevu sil
  const deleteAppointment = useCallback(async (appointmentId, deleteMode = 'single') => {
    try {
      setLoading(true);
      const res = await deleteCalendarAppointment(appointmentId, deleteMode);
      if (res.success) {
        return { success: true };
      } else {
        throw new Error(res.message || 'Randevu silinemedi');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Randevu silinirken bir hata oluştu';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Seçili doktor adını getir
  const getSelectedDoctorName = useCallback(() => {
    if (!loggedInUser) return "Yükleniyor...";
    
    if (loggedInUser.roleId?.roleName === "doctor") {
      return `${loggedInUser.firstName} ${loggedInUser.lastName}`;
    } else if (
      ["admin", "manager", "superadmin", "consultant"].includes(
        loggedInUser.roleId?.roleName
      )
    ) {
      const doc = doctorList.find((d) => d._id === selectedDoctor);
      return doc ? `${doc.firstName} ${doc.lastName}` : "Danışman Seçiniz";
    }
    
    return "Kullanıcı Rolü Tanımsız";
  }, [loggedInUser, selectedDoctor, doctorList]);

  // Doktor seçili mi kontrolü
  const isDoctorSelected = useCallback(() => {
    if (loggedInUser?.roleId?.roleName === "doctor") {
      return true;
    }
    return selectedDoctor !== "";
  }, [loggedInUser, selectedDoctor]);

  // Seçili doktor ID'sini getir
  const getSelectedDoctorId = useCallback(() => {
    if (loggedInUser?.roleId?.roleName === "doctor") {
      return loggedInUser._id;
    }
    return selectedDoctor;
  }, [loggedInUser, selectedDoctor]);

  return {
    // State
    loggedInUser,
    doctorList,
    selectedDoctor,
    appointments,
    loading,
    error,

    // Actions
    setSelectedDoctor,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,

    // Computed
    getSelectedDoctorName,
    isDoctorSelected,
    getSelectedDoctorId,
  };
}; 