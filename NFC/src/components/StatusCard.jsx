export const StatusCard = ({ title, value, icon, color, active }) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
      indigo: 'bg-indigo-50 text-indigo-600'
    };
  
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 transform transition-all duration-200 hover:shadow-xl
        ${active ? 'border-l-4 border-' + color + '-500' : 'border-l-4 border-red-500'}`}>
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${colors[color]}`}>
            {icon}
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="text-lg font-semibold text-gray-900">{value}</p>
          </div>
        </div>
      </div>
    );
  };