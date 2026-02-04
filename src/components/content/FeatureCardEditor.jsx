import React from "react";
import { Trash2, Plus } from "lucide-react";

const FeatureCardEditor = ({ cards, onChange }) => {
  const addCard = () => {
    onChange([
      ...cards,
      {
        icon: "BookOpen",
        title: "New Feature",
        description: "Description here",
        color: "#fee2e2",
      },
    ]);
  };

  const removeCard = (index) => {
    onChange(cards.filter((_, i) => i !== index));
  };

  const updateCard = (index, field, value) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    onChange(newCards);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-700 uppercase">
          Feature Cards
        </h3>
        <button
          type="button"
          onClick={addCard}
          className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100 flex items-center gap-1"
        >
          <Plus size={14} /> Add Card
        </button>
      </div>

      <div className="grid gap-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative group transition-all hover:bg-white hover:shadow-sm"
          >
            <button
              type="button"
              onClick={() => removeCard(index)}
              className="absolute top-2 right-2 text-slate-400 hover:text-red-500 p-1 rounded-full hover:bg-white transition-colors"
            >
              <Trash2 size={16} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">
                  Title
                </label>
                <input
                  type="text"
                  value={card.title}
                  onChange={(e) => updateCard(index, "title", e.target.value)}
                  className="w-full text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Online Courses"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">
                    Icon Name
                  </label>
                  <input
                    type="text"
                    value={card.icon}
                    onChange={(e) => updateCard(index, "icon", e.target.value)}
                    className="w-full text-sm px-3 py-2 border rounded-lg"
                    placeholder="Lucide Icon Name"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">
                    Bg Color
                  </label>
                  <div className="flex items-center gap-2 bg-white border px-2 py-1.5 rounded-lg h-[38px]">
                    <input
                      type="color"
                      value={card.color}
                      onChange={(e) =>
                        updateCard(index, "color", e.target.value)
                      }
                      className="w-6 h-6 rounded cursor-pointer border-none p-0 bg-transparent"
                    />
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-500 mb-1 block">
                  Description
                </label>
                <textarea
                  rows="2"
                  value={card.description}
                  onChange={(e) =>
                    updateCard(index, "description", e.target.value)
                  }
                  className="w-full text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Short description..."
                />
              </div>
            </div>
          </div>
        ))}
        {cards.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-4 italic">
            No feature cards added yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default FeatureCardEditor;
