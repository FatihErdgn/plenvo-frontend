import React, { useState, useEffect } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { APPOINTMENT_TYPES, PARTICIPANT_COUNT_OPTIONS, DAYS, TIME_SLOTS } from "../../../constants/calendarConstants";
import { useFormValidation } from "../../../hooks/useFormValidation";
import { cn, calculateAppointmentDuration, formatDuration } from "../../../utils/calendarUtils";

// Required field indicator component
const RequiredIndicator = () => (
  <span className="text-red-500 ml-1">*</span>
);

// Choice Modal Component
const ChoiceModal = ({ onChoiceNewAppointment, onChoiceRebookAppointment, setShowChoiceModal }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
    <div className="bg-white rounded-2xl shadow-2xl w-96 max-w-[90vw] transform animate-slide-up">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Randevu Seçenekleri
        </h2>
        <div className="space-y-4">
          <button
            onClick={onChoiceNewAppointment}
            className={cn(
              "w-full p-4 text-left rounded-xl transition-all duration-200 hover:scale-105",
              "bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700",
              "text-white shadow-lg hover:shadow-xl"
            )}
          >
            <div className="font-semibold text-lg">Yeni Randevu Oluştur</div>
            <div className="text-sm opacity-90">Tamamen yeni bir randevu kaydet</div>
          </button>
          <button
            onClick={onChoiceRebookAppointment}
            className={cn(
              "w-full p-4 text-left rounded-xl transition-all duration-200 hover:scale-105",
              "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",
              "text-white shadow-lg hover:shadow-xl"
            )}
          >
            <div className="font-semibold text-lg">Randevu Yinele</div>
            <div className="text-sm opacity-90">Mevcut randevuyu farklı saate taşı</div>
          </button>
        </div>
        <button
          onClick={() => setShowChoiceModal(false)}
          className="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl transition-all duration-200"
        >
          Vazgeç
        </button>
      </div>
    </div>
  </div>
);

// Rebook Modal Component
const RebookModal = ({ setShowRebookModal, appointments, onRebookSelect }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
    <div className="bg-white rounded-2xl shadow-2xl w-[500px] max-w-[90vw] max-h-[80vh] overflow-hidden transform animate-slide-up">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Randevu Yinele</h2>
          <button
            onClick={() => setShowRebookModal(false)}
            className="text-gray-500 hover:text-red-500 transition-colors duration-200"
          >
            <IoIosCloseCircleOutline className="w-6 h-6" />
          </button>
        </div>
        <p className="text-gray-600 mt-2">Yinelemek istediğiniz randevuyu seçin</p>
      </div>
      
      <div className="p-4 overflow-y-auto max-h-[60vh]">
        {appointments.length > 0 ? (
          <div className="space-y-3">
            {appointments
              .slice()
              .sort((a, b) => a.dayIndex - b.dayIndex || a.timeIndex - b.timeIndex)
              .map((appt) => (
                <div
                  key={appt._id}
                  className={cn(
                    "p-4 border rounded-xl cursor-pointer transition-all duration-200",
                    "hover:shadow-lg hover:scale-105 hover:border-teal-300",
                    "border-gray-200 bg-white"
                  )}
                  onClick={() => onRebookSelect(appt)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 mb-1">
                        {DAYS[appt.dayIndex]} - {TIME_SLOTS[appt.timeIndex]}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        {appt.participants.map((p) => p.name).join(" - ")}
                      </div>
                      {appt.appointmentType && (
                        <div className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full inline-block">
                          {appt.appointmentType}
                        </div>
                      )}
                    </div>
                    {appt.description && (
                      <div className="text-xs text-gray-500 max-w-[200px] truncate">
                        {appt.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-lg mb-2">Randevu bulunamadı</div>
            <div className="text-sm">Yineleyebileceğiniz randevu bulunmamaktadır</div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => setShowRebookModal(false)}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl transition-all duration-200"
        >
          Vazgeç
        </button>
      </div>
    </div>
  </div>
);

// Main Appointment Modal Component
const MainModal = ({
  editMode,
  selectedDoctorName,
  selectedAppointment,
  setSelectedAppointment,
  description,
  setDescription,
  isRecurring,
  setIsRecurring,
  endDate,
  setEndDate,
  updateAllInstances,
  setUpdateAllInstances,
  isVirtualInstance,
  appointmentType,
  setAppointmentType,
  clearError,
  formErrors,
  selectedService,
  setSelectedService,
  filteredServices,
  participantCount,
  handleParticipantCountChange,
  participantNames,
  setParticipantNames,
  participantPhones,
  handlePhoneChange,
  phoneErrors,
  setShowModal,
  handleSubmit,
  onDelete,
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
    <div className="bg-white rounded-2xl shadow-2xl w-[500px] max-w-[90vw] max-h-[90vh] overflow-hidden transform animate-slide-up">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">
          {editMode ? "Randevu Düzenle" : "Yeni Randevu Oluştur"}
        </h2>
      </div>
      
      <div className="p-6 overflow-y-auto max-h-[70vh]">
        {/* Doctor Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Danışman</label>
          <input
            type="text"
            value={selectedDoctorName}
            readOnly
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700"
          />
        </div>

        {/* Appointment Time and Duration */}
        {selectedAppointment && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Randevu Zamanı</label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                <span className="font-medium text-gray-700">
                  {DAYS[selectedAppointment.dayIndex]} - {TIME_SLOTS[selectedAppointment.timeIndex]}
                </span>
                {selectedAppointment.slotCount > 1 && (
                  <>
                    <span className="text-gray-500 mx-2">→</span>
                    <span className="font-medium text-gray-700">
                      {TIME_SLOTS[selectedAppointment.endTimeIndex + 1]}
                    </span>
                  </>
                )}
              </div>
              {selectedAppointment.slotCount > 1 && (
                <div className="px-4 py-3 bg-teal-50 border border-teal-200 rounded-xl">
                  <span className="text-teal-700 font-medium">
                    {formatDuration(calculateAppointmentDuration(
                      selectedAppointment.timeIndex,
                      selectedAppointment.endTimeIndex
                    ))}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Appointment Duration Editor - for editing mode */}
        {editMode && selectedAppointment && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Randevu Süresi</label>
            <select
              value={selectedAppointment.slotCount || 1}
              onChange={(e) => {
                const newSlotCount = parseInt(e.target.value);
                const maxSlots = Math.min(48 - selectedAppointment.timeIndex, 48);
                const validSlotCount = Math.min(newSlotCount, maxSlots);
                
                setSelectedAppointment({
                  ...selectedAppointment,
                  slotCount: validSlotCount,
                  endTimeIndex: selectedAppointment.timeIndex + validSlotCount - 1
                });
              }}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
            >
              {Array.from({ length: Math.min(48 - selectedAppointment.timeIndex, 16) }, (_, i) => i + 1).map(slotCount => (
                <option key={slotCount} value={slotCount}>
                  {formatDuration(slotCount * 15)}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Randevu süresi değiştirilebilir. Maksimum süre gün sonuna kadar olan süredir.
            </p>
          </div>
        )}

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
            rows="3"
            placeholder="Randevu ile ilgili açıklama giriniz..."
          />
        </div>

        {/* Recurring Appointment */}
        <div className="mb-4">
          <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-200">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
            />
            <span className="text-gray-700 font-medium">Tekrarlı Randevu</span>
          </label>
        </div>

        {/* End Date */}
        {isRecurring && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Bitiş Tarihi (Opsiyonel)</label>
            <input
              type="date"
              value={endDate ? new Date(endDate).toISOString().split('T')[0] : ""}
              onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
            />
            <p className="text-xs text-gray-500 mt-1">
              Boş bırakırsanız, randevu siz silene kadar tekrarlanacaktır.
            </p>
          </div>
        )}

        {/* Update All Instances */}
        {editMode && selectedAppointment && isVirtualInstance(selectedAppointment) && (
          <div className="mb-4">
            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-200">
              <input
                type="checkbox"
                checked={updateAllInstances}
                onChange={(e) => setUpdateAllInstances(e.target.checked)}
                className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <span className="text-gray-700 font-medium">Tüm gelecek randevuları güncelle</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Seçiliyse tüm tekrarlı randevular güncellenecek, değilse sadece bu tarih için güncellenir.
            </p>
          </div>
        )}

        {/* Appointment Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Randevu Tipi
            <RequiredIndicator />
          </label>
          <select
            value={appointmentType}
            onChange={(e) => {
              setAppointmentType(e.target.value);
              clearError('appointmentType');
            }}
            className={cn(
              "w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200",
              formErrors.appointmentType ? 'border-red-500 bg-red-50' : 'border-gray-200'
            )}
          >
            <option value="">Seçiniz</option>
            {APPOINTMENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {formErrors.appointmentType && (
            <p className="text-red-500 text-sm mt-1">Randevu tipi seçilmelidir</p>
          )}
        </div>

        {/* Service Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Randevu Hizmeti
            {appointmentType && filteredServices.length > 0 && <RequiredIndicator />}
          </label>
          <select
            value={selectedService}
            onChange={(e) => {
              setSelectedService(e.target.value);
              clearError('selectedService');
            }}
            className={cn(
              "w-full px-4 py-3 border rounded-xl transition-all duration-200",
              !appointmentType ? "bg-gray-100 cursor-not-allowed" : 
              formErrors.selectedService ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500" : 
              "border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            )}
            disabled={!appointmentType || filteredServices.length === 0}
          >
            <option value="">Seçiniz</option>
            {filteredServices.map((service) => (
              <option key={service._id} value={service._id}>
                {service.serviceName}
              </option>
            ))}
          </select>
          {!appointmentType && (
            <p className="text-amber-500 text-sm mt-1">
              Önce Randevu Tipi seçmelisiniz
            </p>
          )}
          {appointmentType && filteredServices.length === 0 && (
            <p className="text-red-500 text-sm mt-1">
              "{appointmentType}" tipi için tanımlı hizmet bulunamadı
            </p>
          )}
          {formErrors.selectedService && (
            <p className="text-red-500 text-sm mt-1">Randevu hizmeti seçilmelidir</p>
          )}
        </div>

        {/* Participant Count */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Kişi Sayısı</label>
          <select
            value={participantCount}
            onChange={(e) => handleParticipantCountChange(parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
          >
            {PARTICIPANT_COUNT_OPTIONS.map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </div>

        {/* Participant Details */}
        {Array.from({ length: participantCount }, (_, i) => (
          <div key={i} className="mb-6 p-4 border border-gray-200 rounded-xl bg-gray-50">
            <h4 className="font-medium text-gray-700 mb-3">Kişi {i + 1}</h4>
            
            {/* Name */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ad Soyad
                <RequiredIndicator />
              </label>
              <input
                type="text"
                value={participantNames[i] || ""}
                onChange={(e) => {
                  const newNames = [...participantNames];
                  newNames[i] = e.target.value;
                  setParticipantNames(newNames);
                  
                  if (e.target.value.trim() !== '') {
                    clearError('participantNames', i);
                  }
                }}
                className={cn(
                  "w-full px-3 py-2 border rounded-lg transition-all duration-200",
                  formErrors.participantNames[i] ? 
                  "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500" : 
                  "border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                )}
                placeholder="Ad Soyad giriniz"
              />
              {formErrors.participantNames[i] && (
                <p className="text-red-500 text-sm mt-1">Hasta ismi boş olamaz</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefon
                <RequiredIndicator />
              </label>
              <input
                type="text"
                value={participantPhones[i] || ""}
                onChange={(e) => handlePhoneChange(i, e.target.value)}
                className={cn(
                  "w-full px-3 py-2 border rounded-lg transition-all duration-200",
                  (formErrors.participantPhones[i] || phoneErrors[i]) ? 
                  "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500" : 
                  "border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                )}
                placeholder="05XX XXX XX XX"
              />
              {phoneErrors[i] && (
                <p className="text-red-500 text-sm mt-1">{phoneErrors[i]}</p>
              )}
              {formErrors.participantPhones[i] && !phoneErrors[i] && (
                <p className="text-red-500 text-sm mt-1">Telefon numarası gereklidir</p>
              )}
              {!phoneErrors[i] && !formErrors.participantPhones[i] && (
                <p className="text-gray-500 text-sm mt-1">
                  Telefon numarası 0 ile başlamalıdır (Örn: 05XX XXX XX XX)
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
        <button
          onClick={() => setShowModal(false)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-6 py-3 rounded-xl transition-all duration-200"
        >
          Vazgeç
        </button>
        <div className="flex items-center space-x-3">
          {editMode && (
            <button
              onClick={onDelete}
              className="bg-red-100 hover:bg-red-200 text-red-600 font-medium px-4 py-3 rounded-xl transition-all duration-200"
            >
              Sil
            </button>
          )}
          <button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-medium px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            {editMode ? "Değişiklikleri Kaydet" : "Randevu Oluştur"}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Delete Options Modal
const DeleteOptionsModal = ({ setShowDeleteOptionsModal, setDeleteMode, onDeleteConfirm }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
    <div className="bg-white rounded-2xl shadow-2xl w-96 max-w-[90vw] transform animate-slide-up">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Tekrarlı Randevu Silme
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          Bu randevu tekrarlı bir serinin parçası. Hangi randevuları silmek istersiniz?
        </p>
        <div className="space-y-3">
          <button
            onClick={() => {
              setDeleteMode("single");
              onDeleteConfirm();
            }}
            className="w-full text-left p-4 rounded-xl transition-all duration-200 bg-gray-100 hover:bg-gray-200"
          >
            <div className="font-semibold text-gray-800">Sadece Bu Randevuyu Sil</div>
            <div className="text-sm text-gray-600">Sadece seçili tarihteki randevu silinecek</div>
          </button>
          <button
            onClick={() => {
              setDeleteMode("afterThis");
              onDeleteConfirm();
            }}
            className="w-full text-left p-4 rounded-xl transition-all duration-200 bg-gray-100 hover:bg-gray-200"
          >
            <div className="font-semibold text-gray-800">Bu ve Sonraki Randevuları Sil</div>
            <div className="text-sm text-gray-600">Seçili tarih ve sonrasındaki tüm randevular silinecek</div>
          </button>
          <button
            onClick={() => {
              setDeleteMode("allSeries");
              onDeleteConfirm();
            }}
            className="w-full text-left p-4 rounded-xl transition-all duration-200 bg-red-100 hover:bg-red-200"
          >
            <div className="font-semibold text-red-700">Tüm Seriyi Sil</div>
            <div className="text-sm text-red-600">Bu serideki tüm randevular silinecek</div>
          </button>
        </div>
        <button
          onClick={() => setShowDeleteOptionsModal(false)}
          className="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl transition-all duration-200"
        >
          Vazgeç
        </button>
      </div>
    </div>
  </div>
);

const WarningModal = ({ show, onClose, onConfirm, title, message, isRutin = false }) => show && (
  <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
    <div className="bg-white rounded-2xl shadow-2xl w-96 max-w-[90vw] transform animate-slide-up">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-4 py-2 rounded-xl transition-all duration-200"
          >
            Vazgeç
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              "font-medium px-4 py-2 rounded-xl transition-all duration-200 text-white",
              isRutin ? "bg-red-500 hover:bg-red-600" : "bg-teal-500 hover:bg-teal-600"
            )}
          >
            {isRutin ? "Yine de Sil" : "Sil"}
          </button>
        </div>
      </div>
    </div>
  </div>
);

const AppointmentModal = ({
  // Modal control
  showModal,
  setShowModal,
  editMode,
  
  // Choice Modal
  showChoiceModal,
  setShowChoiceModal,
  
  // Rebook Modal
  showRebookModal,
  setShowRebookModal,
  
  // Delete Modals
  showDeleteOptionsModal,
  setShowDeleteOptionsModal,
  showRutinDeleteWarning,
  setShowRutinDeleteWarning,
  showSimpleDeleteWarning,
  setShowSimpleDeleteWarning,
  
  // Form data
  selectedAppointment,
  setSelectedAppointment,
  participantCount,
  setParticipantCount,
  participantNames,
  setParticipantNames,
  participantPhones,
  setParticipantPhones,
  description,
  setDescription,
  isRecurring,
  setIsRecurring,
  endDate,
  setEndDate,
  updateAllInstances,
  setUpdateAllInstances,
  appointmentType,
  setAppointmentType,
  selectedService,
  setSelectedService,
  
  // Data
  appointments,
  filteredServices,
  selectedDoctorName,
  
  // Actions
  onSubmit,
  onDelete,
  onChoiceNewAppointment,
  onChoiceRebookAppointment,
  onRebookSelect,
  onDeleteConfirm,
  onDeleteSimple,
  onDeleteRutin,
  
  // Utils
  isVirtualInstance,
  deleteMode,
  setDeleteMode,
}) => {
  const { 
    formErrors, 
    phoneErrors, 
    validateForm, 
    validatePhone,
    clearError,
    resetErrors,
    initializeParticipantErrors,
    setPhoneErrors
  } = useFormValidation();

  // Initialize participant errors when count changes
  useEffect(() => {
    initializeParticipantErrors(participantCount);
  }, [participantCount, initializeParticipantErrors]);

  // Reset service selection when appointment type changes
  useEffect(() => {
    setSelectedService("");
  }, [appointmentType, setSelectedService]);

  // Handle participant count change
  const handleParticipantCountChange = (count) => {
    setParticipantCount(count);
    const currentNames = [...participantNames];
    const currentPhones = [...participantPhones];
    
    while (currentNames.length < count) {
      currentNames.push("");
      currentPhones.push("");
    }
    
    currentNames.splice(count);
    currentPhones.splice(count);
    
    setParticipantNames(currentNames);
    setParticipantPhones(currentPhones);
  };

  // Handle phone change with validation
  const handlePhoneChange = (index, value) => {
    const newPhones = [...participantPhones];
    newPhones[index] = value;
    setParticipantPhones(newPhones);
    
    // Validate phone and update errors
    validatePhone(index, value);
    
    if (value) {
      clearError('participantPhones', index);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    const formData = {
      appointmentType,
      selectedService,
      participantNames,
      participantPhones,
      filteredServices
    };

    if (validateForm(formData)) {
      onSubmit();
    }
  };

  if (!showModal && !showChoiceModal && !showRebookModal && !showDeleteOptionsModal && !showRutinDeleteWarning && !showSimpleDeleteWarning) {
    return null;
  }

  return (
    <>
      {showChoiceModal && (
        <ChoiceModal
          onChoiceNewAppointment={onChoiceNewAppointment}
          onChoiceRebookAppointment={onChoiceRebookAppointment}
          setShowChoiceModal={setShowChoiceModal}
        />
      )}

      {showRebookModal && (
        <RebookModal
          setShowRebookModal={setShowRebookModal}
          appointments={appointments}
          onRebookSelect={onRebookSelect}
        />
      )}

      {showModal && (
        <MainModal
          editMode={editMode}
          selectedDoctorName={selectedDoctorName}
          selectedAppointment={selectedAppointment}
          setSelectedAppointment={setSelectedAppointment}
          description={description}
          setDescription={setDescription}
          isRecurring={isRecurring}
          setIsRecurring={setIsRecurring}
          endDate={endDate}
          setEndDate={setEndDate}
          updateAllInstances={updateAllInstances}
          setUpdateAllInstances={setUpdateAllInstances}
          isVirtualInstance={isVirtualInstance}
          appointmentType={appointmentType}
          setAppointmentType={setAppointmentType}
          clearError={clearError}
          formErrors={formErrors}
          selectedService={selectedService}
          setSelectedService={setSelectedService}
          filteredServices={filteredServices}
          participantCount={participantCount}
          handleParticipantCountChange={handleParticipantCountChange}
          participantNames={participantNames}
          setParticipantNames={setParticipantNames}
          participantPhones={participantPhones}
          handlePhoneChange={handlePhoneChange}
          phoneErrors={phoneErrors}
          setShowModal={setShowModal}
          handleSubmit={handleSubmit}
          onDelete={onDelete}
        />
      )}
      
      {showDeleteOptionsModal && (
        <DeleteOptionsModal
          setShowDeleteOptionsModal={setShowDeleteOptionsModal}
          setDeleteMode={setDeleteMode}
          onDeleteConfirm={onDeleteConfirm}
        />
      )}

      <WarningModal
        show={showRutinDeleteWarning}
        onClose={() => setShowRutinDeleteWarning(false)}
        onConfirm={onDeleteRutin}
        title="Rutin Görüşme Silme"
        message="Bu randevu 'Rutin Görüşme' olarak işaretlenmiş. Silmek istediğinize emin misiniz?"
        isRutin={true}
      />
      
      <WarningModal
        show={showSimpleDeleteWarning}
        onClose={() => setShowSimpleDeleteWarning(false)}
        onConfirm={onDeleteSimple}
        title="Randevu Silme Onayı"
        message="Bu randevuyu silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
      />
    </>
  );
};

export default AppointmentModal; 