import React from 'react';

function Cards({ 
    cards, 
    selectedOrg, 
    selectedDept, 
    setEditingCard, 
    setCardFormData, 
    setShowCardModal, 
    handleDeleteCard, 
    formatDate 
}) {
    if (!selectedDept) {
        return (
            <div className="text-center py-8 text-gray-500">
                Please select a department to view cards
            </div>
        );
    }

    return (
        <div className="mt-6 bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold">Cards</h2>
                    <p className="text-sm text-gray-500">
                        {selectedOrg.name} - {selectedDept.name}
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingCard(null);
                        setShowCardModal(true);
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                    Add Card
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Card ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Holder</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid From</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid Until</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {cards.map((card) => (
                            <tr key={card._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{card.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{card.holderName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">{card.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {formatDate(card.validFrom)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {formatDate(card.validUntil)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs rounded-full ${card.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {card.active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="text-sm">
                                        <div>{card.email}</div>
                                        <div>{card.phone}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => {
                                                setEditingCard(card);
                                                setCardFormData({
                                                    id: card.id,
                                                    holderName: card.holderName,
                                                    type: card.type,
                                                    email: card.email,
                                                    phone: card.phone,
                                                    validFrom: card.validFrom.split('T')[0],
                                                    validUntil: card.validUntil.split('T')[0],
                                                    active: card.active
                                                });
                                                setShowCardModal(true);
                                            }}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <i className="bi bi-pencil"></i>
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Are you sure you want to delete this card?')) {
                                                    handleDeleteCard(card._id);
                                                }
                                            }}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Cards; 