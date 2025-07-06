import React, { useState, useEffect, useMemo, useCallback } from "react";
import PaymentPopup from "../ConsultantTable/PayNowButton";
import { getWeekStart, calculateAppointmentDate, isVirtualInstance } from "../../../utils/calendarUtils";
import { useAppointments } from "../../../hooks/useAppointments";
import CalendarGrid from "./CalendarGrid";
import DatePicker from "./DatePicker";
import AppointmentModal from "./AppointmentModal";
import { APPOINTMENT_TYPES,DAYS,DAYS_SHORT,TIME_SLOTS } from "../../../constants/calendarConstants";

const CalendarSchedulePage = ({ servicesData = [] }) => {
  // Core calendar state
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));
  
  // Payment state
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentRefreshTrigger, setPaymentRefreshTrigger] = useState(0);
  const [preventAutoPopup, setPreventAutoPopup] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [showRebookModal, setShowRebookModal] = useState(false);
  const [showDeleteOptionsModal, setShowDeleteOptionsModal] = useState(false);
  const [showRutinDeleteWarning, setShowRutinDeleteWarning] = useState(false);
  const [showSimpleDeleteWarning, setShowSimpleDeleteWarning] = useState(false);
  
  // Form state
  const [editMode, setEditMode] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedCell, setSelectedCell] = useState({ dayIndex: null, timeIndex: null });
  const [rebookBookingId, setRebookBookingId] = useState(null);
  const [deleteMode, setDeleteMode] = useState("single");
  
  // Form data
  const [participantCount, setParticipantCount] = useState(1);
  const [participantNames, setParticipantNames] = useState([""]);
  const [participantPhones, setParticipantPhones] = useState([""]);
  const [description, setDescription] = useState("");
  const [isRecurring, setIsRecurring] = useState(true);
  const [endDate, setEndDate] = useState(null);
  const [updateAllInstances, setUpdateAllInstances] = useState(false);
  const [appointmentType, setAppointmentType] = useState("");
  const [selectedService, setSelectedService] = useState("");

  // Use appointments hook
  const {
    loggedInUser,
    doctorList,
    selectedDoctor,
    appointments,
    loading,
    error,
    setSelectedDoctor,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getSelectedDoctorName,
    isDoctorSelected,
    getSelectedDoctorId,
  } = useAppointments();

  // Fetch appointments when dependencies change
  useEffect(() => {
    const doctorId = getSelectedDoctorId();
    if (doctorId && isDoctorSelected()) {
      fetchAppointments(doctorId, currentWeekStart);
    }
  }, [currentWeekStart, fetchAppointments, getSelectedDoctorId, isDoctorSelected]);

  // Filter services based on selected doctor and appointment type
  const filteredServices = useMemo(() => {
    if (!servicesData || !selectedDoctor || !appointmentType) return [];
    
    const doctorName = getSelectedDoctorName();
    
    return servicesData.filter(service => 
      service.provider === doctorName &&
      service.serviceType === appointmentType &&
      service.status === "Aktif"
    );
  }, [servicesData, selectedDoctor, appointmentType, getSelectedDoctorName]);

  // Handle week change
  const handleWeekChange = useCallback((newWeekStart) => {
    setCurrentWeekStart(newWeekStart);
  }, []);

  // Handle cell click
  const handleCellClick = useCallback((dayIndex, timeIndex, appointment, multiSelectInfo = null) => {
    if (loggedInUser?.roleId?.roleName === "doctor") return;
    
    const weekDates = Array.from({ length: 7 }, (_, i) => 
      new Date(currentWeekStart.getTime() + i * 24 * 60 * 60 * 1000)
    );
    const selectedDate = weekDates[dayIndex];
    const appointmentDate = calculateAppointmentDate(selectedDate, timeIndex);
    
    // Multi-select durumunda endTimeIndex'i hesapla
    const endTimeIndex = multiSelectInfo?.endTimeIndex || timeIndex;
    const slotCount = multiSelectInfo?.slotCount || 1;
    
    setSelectedCell({ 
      dayIndex, 
      timeIndex, 
      appointmentDate,
      endTimeIndex,
      slotCount,
      isMultiSelect: multiSelectInfo?.isMultiSelect || false
    });
    
    if (appointment) {
      // Edit existing appointment
      setEditMode(true);
      setSelectedAppointment(appointment);
      setParticipantCount(appointment.participants?.length || 1);
      setParticipantNames(appointment.participants?.map(p => p.name || "") || [""]);
      setParticipantPhones(appointment.participants?.map(p => p.phone || "") || [""]);
      setDescription(appointment.description || "");
      setIsRecurring(appointment.isRecurring !== undefined ? appointment.isRecurring : true);
      setEndDate(appointment.endDate);
      setUpdateAllInstances(false);
      setAppointmentType(appointment.appointmentType || "");
      setSelectedService(appointment.serviceId || "");
      setShowModal(true);
    } else {
      // Show choice modal for new appointment
      setSelectedAppointment(null);
      setShowChoiceModal(true);
    }
  }, [loggedInUser, currentWeekStart]);

  // Handle payment click
  const handlePaymentClick = useCallback((appointment) => {
    setSelectedAppointment(appointment);
    setPaymentOpen(true);
  }, []);

  // Refresh appointments with payment trigger
  const refreshAppointments = useCallback(async () => {
    setPreventAutoPopup(true);
    
    const doctorId = getSelectedDoctorId();
    if (doctorId) {
      await fetchAppointments(doctorId, currentWeekStart);
      setPaymentRefreshTrigger(prev => prev + 1);
      setSelectedAppointment(null);
      setRebookBookingId(null);
    }
    
    setTimeout(() => {
      setPreventAutoPopup(false);
    }, 3000);
  }, [getSelectedDoctorId, fetchAppointments, currentWeekStart]);

  // Reset form data
  const resetFormData = useCallback(() => {
    setParticipantCount(1);
    setParticipantNames([""]);
    setParticipantPhones([""]);
    setDescription("");
    setRebookBookingId(null);
    setIsRecurring(true);
    setEndDate(null);
    setUpdateAllInstances(false);
    setAppointmentType("");
    setSelectedService("");
  }, []);

  // Handle new appointment choice
  const handleNewAppointment = useCallback(() => {
    setEditMode(false);
    if (!selectedAppointment) {
      setSelectedAppointment({
        dayIndex: selectedCell.dayIndex,
        timeIndex: selectedCell.timeIndex,
        endTimeIndex: selectedCell.endTimeIndex || selectedCell.timeIndex,
        slotCount: selectedCell.slotCount || 1,
        appointmentDate: selectedCell.appointmentDate,
        participants: [],
      });
    }
    resetFormData();
    setShowChoiceModal(false);
    setShowModal(true);
  }, [selectedAppointment, selectedCell, resetFormData]);

  // Handle rebook appointment choice
  const handleRebookAppointment = useCallback(() => {
    setShowChoiceModal(false);
    setShowRebookModal(true);
    setEditMode(false);
  }, []);

  // Handle rebook selection
  const handleRebookSelect = useCallback((appointment) => {
    setRebookBookingId(appointment.bookingId || appointment._id);
    
    const weekDates = Array.from({ length: 7 }, (_, i) => 
      new Date(currentWeekStart.getTime() + i * 24 * 60 * 60 * 1000)
    );
    const selectedDate = weekDates[selectedCell.dayIndex];
    const newAppointmentDate = calculateAppointmentDate(selectedDate, selectedCell.timeIndex);

    const slotCount = appointment.slotCount || 1;
    const newEndTimeIndex = selectedCell.timeIndex + slotCount - 1;

    setSelectedAppointment({
      ...appointment,
      dayIndex: selectedCell.dayIndex,
      timeIndex: selectedCell.timeIndex,
      endTimeIndex: newEndTimeIndex,
      slotCount: slotCount,
      appointmentDate: newAppointmentDate
    });
    
    setParticipantCount(appointment.participants?.length || 1);
    setParticipantNames(appointment.participants?.map(p => p.name || "") || [""]);
    setParticipantPhones(appointment.participants?.map(p => p.phone || "") || [""]);
    setDescription(appointment.description || "");
    setIsRecurring(appointment.isRecurring !== undefined ? appointment.isRecurring : true);
    setEndDate(appointment.endDate);
    setUpdateAllInstances(false);
    setAppointmentType(appointment.appointmentType || "");
    setSelectedService(appointment.serviceId || "");
    setShowRebookModal(false);
    setShowModal(true);
  }, [selectedCell, currentWeekStart]);

  // Handle form submit
  const handleSubmit = useCallback(async () => {
    if (!selectedAppointment) return;
    
    const doctorId = getSelectedDoctorId();
    const appointmentDate = selectedAppointment.appointmentDate || 
      calculateAppointmentDate(
        new Date(currentWeekStart.getTime() + selectedAppointment.dayIndex * 24 * 60 * 60 * 1000),
        selectedAppointment.timeIndex
      );
        
    const payload = {
      dayIndex: selectedAppointment.dayIndex,
      timeIndex: selectedAppointment.timeIndex,
      endTimeIndex: selectedAppointment.endTimeIndex || selectedAppointment.timeIndex,
      slotCount: selectedAppointment.slotCount || 1,
      doctorId,
      participants: participantNames.map((name, index) => ({ 
        name, 
        phone: participantPhones[index] || "" 
      })),
      description,
      appointmentDate,
      isRecurring,
      endDate,
      appointmentType,
      serviceId: selectedService || null
    };

    if (rebookBookingId) {
      payload.bookingId = rebookBookingId;
    }

    if (editMode && selectedAppointment._id && selectedAppointment._id.includes("_instance_")) {
      payload.updateAllInstances = updateAllInstances;
    }

    try {
      let result;
      if (editMode) {
        result = await updateAppointment(selectedAppointment._id, payload);
      } else {
        result = await createAppointment(payload);
      }
      
      if (result.success) {
        await refreshAppointments();
          setShowModal(false);
      } else {
        alert(result.error || 'Randevu kaydedilirken bir hata oluştu.');
      }
    } catch (err) {
      alert('Beklenmeyen bir hata oluştu.');
    }
  }, [
    selectedAppointment, getSelectedDoctorId, currentWeekStart, participantNames, 
    participantPhones, description, isRecurring, endDate, appointmentType, 
    selectedService, rebookBookingId, editMode, updateAllInstances, 
    updateAppointment, createAppointment, refreshAppointments
  ]);

  // Handle delete
  const handleDelete = useCallback(() => {
    if (!selectedAppointment) return;
    
    if (selectedAppointment._id && selectedAppointment._id.includes("_instance_")) {
      setShowDeleteOptionsModal(true);
    } else {
      if (selectedAppointment.appointmentType === "Rutin Görüşme") {
        setShowRutinDeleteWarning(true);
      } else {
        setShowSimpleDeleteWarning(true);
      }
    }
  }, [selectedAppointment]);

  // Handle delete confirm
  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedAppointment) return;
          
    const result = await deleteAppointment(selectedAppointment._id, deleteMode);
    
    if (result.success) {
      await refreshAppointments();
      setShowDeleteOptionsModal(false);
        setShowModal(false);
    } else {
      alert(result.error || 'Randevu silinirken bir hata oluştu.');
    }
  }, [selectedAppointment, deleteMode, deleteAppointment, refreshAppointments]);

  // Handle simple delete
  const handleDeleteSimple = useCallback(async () => {
    if (!selectedAppointment) return;
        
    const result = await deleteAppointment(selectedAppointment._id);
    
    if (result.success) {
      setRebookBookingId(null);
      await refreshAppointments();
      setShowSimpleDeleteWarning(false);
      setShowModal(false);
    } else {
      alert(result.error || 'Randevu silinirken bir hata oluştu.');
    }
  }, [selectedAppointment, deleteAppointment, refreshAppointments]);

  // Handle rutin delete
  const handleDeleteRutin = useCallback(async () => {
    if (!selectedAppointment) return;
        
    const result = await deleteAppointment(selectedAppointment._id);
    
    if (result.success) {
      setRebookBookingId(null);
      await refreshAppointments();
      setShowRutinDeleteWarning(false);
      setShowModal(false);
    } else {
      alert(result.error || 'Randevu silinirken bir hata oluştu.');
      }
  }, [selectedAppointment, deleteAppointment, refreshAppointments]);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-[95%] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Randevu Takvimi
              </h1>
              <p className="text-gray-600">
                Randevularınızı görüntüleyin ve yönetin
              </p>
            </div>

            {/* Doctor Selection and Date Picker - Side by Side */}
            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 items-start">
              {/* Doctor Selection */}
        {loggedInUser?.roleId?.roleName !== "doctor" && (
                <div className="w-full sm:w-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-2 min-h-[20px]">
                    Danışman Seç
                  </label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="w-full sm:w-64 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
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
        
              {/* Date Navigation */}
              <div className="w-full sm:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2 min-h-[20px]">
                  Tarih Seçin
                </label>
                <DatePicker
                  currentWeekStart={currentWeekStart}
                  onWeekChange={handleWeekChange}
                  isDoctorSelected={isDoctorSelected()}
                />
              </div>
                        </div>
                        </div>
              </div>
              
        {/* Warning for no doctor selected */}
        {!isDoctorSelected() && loggedInUser?.roleId?.roleName !== "doctor" && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-amber-600 text-sm font-semibold">!</span>
              </div>
            </div>
              <div>
                <h3 className="text-amber-800 font-medium">Danışman Seçimi Gerekli</h3>
                <p className="text-amber-700 text-sm">
                  Takvimi görüntülemek için lütfen bir danışman seçin
                </p>
              </div>
              </div>
            </div>
          )}

        {/* Calendar Grid */}
        <div className="relative border border-gray-200 rounded-xl bg-white shadow-sm">
          <div className="overflow-auto max-h-[calc(100vh-14rem)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
            <CalendarGrid
              appointments={appointments}
              currentWeekStart={currentWeekStart}
              selectedDoctorName={getSelectedDoctorName()}
              isDoctorSelected={isDoctorSelected()}
              onCellClick={handleCellClick}
              onPaymentClick={handlePaymentClick}
              paymentRefreshTrigger={paymentRefreshTrigger}
              preventAutoPopup={preventAutoPopup}
              refreshAppointments={refreshAppointments}
            />
          </div>
        </div>

        {/* Loading and Error Messages */}
        <div className="mt-4 space-y-4">
          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-center">
              <div className="flex items-center space-x-2 text-teal-600">
                <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium">Yükleniyor...</span>
          </div>
        </div>
      )}

          {/* Error message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm">{error}</p>
                      </div>
                    )}
                  </div>

        {/* Modals */}
        <AppointmentModal
          // Modal control
          showModal={showModal}
          setShowModal={setShowModal}
          editMode={editMode}
          
          // Choice Modal
          showChoiceModal={showChoiceModal}
          setShowChoiceModal={setShowChoiceModal}
          
          // Rebook Modal
          showRebookModal={showRebookModal}
          setShowRebookModal={setShowRebookModal}
          
          // Delete Modals
          showDeleteOptionsModal={showDeleteOptionsModal}
          setShowDeleteOptionsModal={setShowDeleteOptionsModal}
          showRutinDeleteWarning={showRutinDeleteWarning}
          setShowRutinDeleteWarning={setShowRutinDeleteWarning}
          showSimpleDeleteWarning={showSimpleDeleteWarning}
          setShowSimpleDeleteWarning={setShowSimpleDeleteWarning}
          
          // Form data
          selectedAppointment={selectedAppointment}
          participantCount={participantCount}
          setParticipantCount={setParticipantCount}
          participantNames={participantNames}
          setParticipantNames={setParticipantNames}
          participantPhones={participantPhones}
          setParticipantPhones={setParticipantPhones}
          description={description}
          setDescription={setDescription}
          isRecurring={isRecurring}
          setIsRecurring={setIsRecurring}
          endDate={endDate}
          setEndDate={setEndDate}
          updateAllInstances={updateAllInstances}
          setUpdateAllInstances={setUpdateAllInstances}
          appointmentType={appointmentType}
          setAppointmentType={setAppointmentType}
          selectedService={selectedService}
          setSelectedService={setSelectedService}
          
          // Data
          appointments={appointments}
          filteredServices={filteredServices}
          selectedDoctorName={getSelectedDoctorName()}
          
          // Actions
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          onChoiceNewAppointment={handleNewAppointment}
          onChoiceRebookAppointment={handleRebookAppointment}
          onRebookSelect={handleRebookSelect}
          onDeleteConfirm={handleDeleteConfirm}
          onDeleteSimple={handleDeleteSimple}
          onDeleteRutin={handleDeleteRutin}
          
          // Utils
          isVirtualInstance={isVirtualInstance}
          deleteMode={deleteMode}
          setDeleteMode={setDeleteMode}
        />

        {/* Payment Popup */}
      {paymentOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
          <PaymentPopup
            isOpen={paymentOpen}
            onClose={() => {
              setPaymentOpen(false);
              setPreventAutoPopup(true);
              setTimeout(() => {
                setPreventAutoPopup(false); 
              }, 3000);
            }}
            servicesData={servicesData}
            row={selectedAppointment}
            onPaymentSuccess={() => {
              setPreventAutoPopup(true);
                refreshAppointments();
            }}
            isCalendar={true}
          />
        </div>
      )}
                </div>
    </div>
  );
};

export default CalendarSchedulePage; 