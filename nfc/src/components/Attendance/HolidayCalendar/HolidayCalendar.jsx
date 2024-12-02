import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const localizer = momentLocalizer(moment);

const HolidayCalendar = () => {
    const [holidays, setHolidays] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedHoliday, setSelectedHoliday] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        start: new Date(),
        end: new Date(),
        type: 'public', // public, restricted, optional
        description: '',
        repeatsAnnually: false
    });

    const eventStyleGetter = (event) => {
        let style = {
            backgroundColor: '#3182ce',
            borderRadius: '5px',
            opacity: 0.8,
            color: 'white',
            border: '0px',
            display: 'block'
        };

        if (event.type === 'public') {
            style.backgroundColor = '#48bb78';
        } else if (event.type === 'restricted') {
            style.backgroundColor = '#ed8936';
        }

        return {
            style
        };
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Holiday Calendar</h2>
                <button
                    onClick={() => {
                        setSelectedHoliday(null);
                        setShowModal(true);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    <FaPlus />
                    <span>Add Holiday</span>
                </button>
            </div>

            <div className="h-[600px]">
                <Calendar
                    localizer={localizer}
                    events={holidays}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    eventPropGetter={eventStyleGetter}
                    views={['month', 'week', 'day']}
                    onSelectEvent={(event) => {
                        setSelectedHoliday(event);
                        setShowModal(true);
                    }}
                />
            </div>

            {/* Add Holiday Modal */}
            {/* ... Modal implementation ... */}
        </div>
    );
};

export default HolidayCalendar; 