import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface LearningCalendarProps {
    currentDate: Date;
    onDateSelect: (date: Date) => void;
    worksheetDates: string[]; // ISO strings
}

export const LearningCalendar: React.FC<LearningCalendarProps> = ({
    currentDate,
    onDateSelect,
    worksheetDates
}) => {
    const [viewDate, setViewDate] = React.useState(new Date());

    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const hasWorksheet = (date: Date) => {
        return worksheetDates.some(wsDate => isSameDay(new Date(wsDate), date));
    };

    return (
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-indigo-50/50">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <CalendarIcon size={18} className="text-[#6C63FF]" />
                    <h3 className="font-extrabold text-[#1A1F3A] text-sm uppercase tracking-wider">Learning Journal</h3>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setViewDate(subMonths(viewDate, 1))}
                        className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={() => setViewDate(addMonths(viewDate, 1))}
                        className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <div className="text-center mb-4">
                <span className="text-lg font-extrabold text-[#1A1F3A]">
                    {format(viewDate, 'MMMM yyyy')}
                </span>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                    <div key={day} className="text-[10px] font-bold text-slate-400 text-center py-2">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {days.map(day => {
                    const active = isSameDay(day, currentDate);
                    const hasWS = hasWorksheet(day);
                    const today = isToday(day);

                    return (
                        <button
                            key={day.toString()}
                            onClick={() => onDateSelect(day)}
                            className={`
                aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all
                ${active ? 'bg-[#6C63FF] text-white shadow-lg shadow-indigo-100' : 'hover:bg-slate-50 text-slate-600'}
                ${!isSameMonth(day, viewDate) ? 'opacity-20' : ''}
              `}
                        >
                            <span className={`text-xs font-bold ${active ? 'text-white' : 'text-slate-700'}`}>
                                {format(day, 'd')}
                            </span>
                            {hasWS && !active && (
                                <div className="absolute bottom-1.5 w-1 h-1 bg-[#5DCEA0] rounded-full" />
                            )}
                            {today && !active && (
                                <div className="absolute top-1 right-1 w-1 h-1 bg-amber-400 rounded-full" />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-[#5DCEA0] rounded-full" />
                    <span>Practice Done</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                    <span>Today</span>
                </div>
            </div>
        </div>
    );
};
