export const AccessInfoCard = ({ title, value, icon, subtext }) => (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center mb-2">
        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
          {icon}
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-lg font-semibold text-gray-900">{value}</p>
        </div>
      </div>
      <p className="text-xs text-gray-500">{subtext}</p>
    </div>
  );