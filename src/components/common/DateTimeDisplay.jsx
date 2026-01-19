import React, { useState, useMemo, useEffect } from 'react';
import { Pencil, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatSmartDate, formatRelativeTime } from '../../utils/helpers';
import Modal from './Modal';
import Button from './Button';

const DateTimeDisplay = ({
  dateTime,
  onDateChange,
  editable = false,
  label = "모임 일시"
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const dateInfo = useMemo(() => formatSmartDate(dateTime), [dateTime]);

  if (!dateInfo) {
    return (
      <div className="text-gray-400 dark:text-gray-500 text-sm">
        날짜 정보 없음
      </div>
    );
  }

  const handleSave = async (newDate) => {
    if (!onDateChange) return;

    setIsSaving(true);
    try {
      await onDateChange(newDate);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      setIsEditing(false);
    } catch (error) {
      console.error('날짜 저장 실패:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const relativeTime = formatRelativeTime(dateTime);

  return (
    <>
      <div
        className={`
          group relative flex items-center gap-3 p-3 rounded-xl transition-all duration-200
          ${editable ? 'cursor-pointer' : ''}
          ${isHovered && editable ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-transparent'}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => editable && setIsEditing(true)}
        role={editable ? "button" : undefined}
        aria-label={editable ? `${label} 수정: ${dateInfo.month}월 ${dateInfo.day}일 ${dateInfo.timeString}` : undefined}
        tabIndex={editable ? 0 : undefined}
        onKeyDown={(e) => {
          if (editable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setIsEditing(true);
          }
        }}
      >
        {/* 캘린더 뱃지 */}
        <div className="flex-shrink-0 w-14 h-16 bg-gradient-to-b from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg shadow-sm overflow-hidden">
          <div className="h-5 bg-blue-600 dark:bg-blue-700 flex items-center justify-center">
            <span className="text-[10px] font-medium text-blue-100">
              {dateInfo.month}월
            </span>
          </div>
          <div className="h-11 bg-white dark:bg-gray-800 flex items-center justify-center">
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {dateInfo.day}
            </span>
          </div>
        </div>

        {/* 시간 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-white">
              {dateInfo.relativeText || `${dateInfo.month}월 ${dateInfo.day}일`}
            </span>
            <span className="text-gray-400 dark:text-gray-500">·</span>
            <span className="text-gray-600 dark:text-gray-300">
              {dateInfo.dayName}요일
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-900 dark:text-white font-medium">
              {dateInfo.timeString}
            </span>
            {showSuccess ? (
              <span className="text-xs text-green-500 flex items-center gap-1">
                <Check size={12} /> 저장됨
              </span>
            ) : (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {relativeTime}
              </span>
            )}
          </div>
        </div>

        {/* 편집 버튼 (hover 시 표시) */}
        {editable && (
          <div className={`
            absolute right-3 top-1/2 -translate-y-1/2
            transition-opacity duration-200
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `}>
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Pencil size={14} className="text-gray-500 dark:text-gray-400" />
            </div>
          </div>
        )}

        {/* 저장 중 오버레이 */}
        {isSaving && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 rounded-xl flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* 날짜/시간 편집 모달 */}
      {editable && (
        <DateTimePicker
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          initialDate={dateInfo.fullDate}
          onSave={handleSave}
        />
      )}
    </>
  );
};

// DateTimePicker 컴포넌트
const DateTimePicker = ({ isOpen, onClose, initialDate, onSave }) => {
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date());
  const [viewDate, setViewDate] = useState(initialDate || new Date());
  const [selectedHour, setSelectedHour] = useState(
    initialDate ? initialDate.getHours() : 12
  );
  const [selectedMinute, setSelectedMinute] = useState(
    initialDate ? initialDate.getMinutes() : 0
  );

  // 모달이 열릴 때 initialDate로 상태 리셋
  useEffect(() => {
    if (isOpen && initialDate) {
      setSelectedDate(initialDate);
      setViewDate(initialDate);
      setSelectedHour(initialDate.getHours());
      setSelectedMinute(initialDate.getMinutes());
    }
  }, [isOpen, initialDate]);

  const daysInMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth(),
    1
  ).getDay();

  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleSelectDay = (day) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    setSelectedDate(newDate);
  };

  const handleSave = () => {
    const finalDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      selectedHour,
      selectedMinute
    );
    onSave(finalDate);
  };

  const isSelectedDay = (day) => {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === viewDate.getMonth() &&
      selectedDate.getFullYear() === viewDate.getFullYear()
    );
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === viewDate.getMonth() &&
      today.getFullYear() === viewDate.getFullYear()
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="날짜 및 시간 선택">
      <div className="space-y-6">
        {/* 캘린더 헤더 */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <span className="font-semibold text-gray-900 dark:text-white">
            {viewDate.getFullYear()}년 {viewDate.getMonth() + 1}월
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => (
            <div
              key={day}
              className="h-8 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400"
            >
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 gap-1">
          {/* 빈 셀 (월 시작 전) */}
          {Array.from({ length: firstDayOfMonth }, (_, i) => (
            <div key={`empty-${i}`} className="h-10" />
          ))}

          {/* 날짜 셀 */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            return (
              <button
                key={day}
                onClick={() => handleSelectDay(day)}
                className={`
                  h-10 rounded-lg text-sm font-medium transition-all
                  ${isSelectedDay(day)
                    ? 'bg-blue-500 text-white shadow-sm'
                    : isToday(day)
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }
                `}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* 시간 선택 */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            시간 선택
          </label>
          <div className="flex items-center gap-3">
            <select
              value={selectedHour}
              onChange={(e) => setSelectedHour(parseInt(e.target.value))}
              className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {i < 12 ? '오전' : '오후'} {i % 12 || 12}시
                </option>
              ))}
            </select>
            <span className="text-gray-500 dark:text-gray-400">:</span>
            <select
              value={selectedMinute}
              onChange={(e) => setSelectedMinute(parseInt(e.target.value))}
              className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((min) => (
                <option key={min} value={min}>
                  {min.toString().padStart(2, '0')}분
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="secondary"
            fullWidth
            onClick={onClose}
          >
            <X size={16} className="mr-1" />
            취소
          </Button>
          <Button
            fullWidth
            onClick={handleSave}
          >
            <Check size={16} className="mr-1" />
            저장
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DateTimeDisplay;