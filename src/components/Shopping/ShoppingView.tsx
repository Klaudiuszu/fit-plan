import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { toggleBought, resetShopping, addCustomItem, removeItem } from '../../store/shoppingSlice';
import { ShoppingCart, RotateCcw, Plus, Trash2, Check } from 'lucide-react';

const CATEGORY_ICONS: Record<string, string> = {
  'Mięso i nabiał':    '🥩',
  'Warzywa i owoce':   '🥦',
  'Produkty suche':    '🌾',
  'Inne':              '🧂',
};

export default function ShoppingView() {
  const dispatch = useDispatch();
  const items = useSelector((s: RootState) => s.shopping.items);

  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCat, setNewCat] = useState('Inne');
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterCat, setFilterCat] = useState<string | null>(null);

  const categories = Array.from(new Set(items.map(i => i.category)));
  const boughtCount = items.filter(i => i.bought).length;
  const progress = items.length ? Math.round((boughtCount / items.length) * 100) : 0;

  const filtered = filterCat ? items.filter(i => i.category === filterCat) : items;
  const groupedByCategory = categories.reduce<Record<string, typeof items>>((acc, cat) => {
    const catItems = filtered.filter(i => i.category === cat);
    if (catItems.length) acc[cat] = catItems;
    return acc;
  }, {});

  function handleAdd() {
    if (!newName.trim()) return;
    dispatch(addCustomItem({ name: newName.trim(), amount: newAmount.trim() || '1 szt', category: newCat }));
    setNewName(''); setNewAmount(''); setShowAddForm(false);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Lista zakupów</h1>
          <p className="text-sm text-gray-500 mt-0.5">Zakupy na 1 tydzień diety</p>
        </div>
        <button
          onClick={() => { if (confirm('Zresetować listę zakupów?')) dispatch(resetShopping()); }}
          className="btn-ghost flex items-center gap-1.5"
        >
          <RotateCcw size={14} />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Progress */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ShoppingCart size={16} className="text-accent" />
            <span className="text-sm font-medium text-gray-200">Postęp zakupów</span>
          </div>
          <span className="text-sm font-bold text-accent">{boughtCount} / {items.length}</span>
        </div>
        <div className="h-2 rounded-full bg-surface-600 overflow-hidden">
          <div className="h-full rounded-full bg-accent transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-gray-500 mt-1.5">{progress}% zakupionych</p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCat(null)}
          className={`badge border transition-colors ${!filterCat ? 'bg-accent/20 text-accent border-accent/30' : 'bg-surface-700 text-gray-400 border-surface-600 hover:text-gray-200'}`}
        >
          Wszystkie
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(filterCat === cat ? null : cat)}
            className={`badge border transition-colors ${filterCat === cat ? 'bg-accent/20 text-accent border-accent/30' : 'bg-surface-700 text-gray-400 border-surface-600 hover:text-gray-200'}`}
          >
            {CATEGORY_ICONS[cat] ?? '•'} {cat}
          </button>
        ))}
      </div>

      {/* Items by category */}
      {Object.entries(groupedByCategory).map(([cat, catItems]) => (
        <div key={cat} className="card space-y-1.5">
          <p className="font-medium text-gray-300 text-sm mb-2">
            {CATEGORY_ICONS[cat] ?? '•'} {cat}
            <span className="ml-2 text-gray-500 text-xs">({catItems.filter(i => i.bought).length}/{catItems.length})</span>
          </p>
          {catItems.map(item => (
            <div
              key={item.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors ${
                item.bought
                  ? 'bg-emerald-500/5 border-emerald-500/20 opacity-60'
                  : 'bg-surface-700 border-surface-600 hover:border-surface-500'
              }`}
            >
              <button
                onClick={() => dispatch(toggleBought(item.id))}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  item.bought ? 'border-emerald-400 bg-emerald-400' : 'border-gray-500 hover:border-gray-300'
                }`}
              >
                {item.bought && <Check size={11} strokeWidth={3} className="text-surface-900" />}
              </button>
              <span className={`flex-1 text-sm ${item.bought ? 'line-through text-gray-500' : 'text-gray-200'}`}>{item.name}</span>
              <span className="text-xs text-gray-500 shrink-0">{item.amount}</span>
              {item.id.startsWith('custom_') && (
                <button
                  onClick={() => dispatch(removeItem(item.id))}
                  className="text-gray-600 hover:text-rose-400 transition-colors ml-1 shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Add custom item */}
      <div className="card">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors text-sm"
          >
            <Plus size={16} />
            Dodaj własny produkt
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-200">Dodaj produkt</p>
            <input
              className="input"
              placeholder="Nazwa produktu"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              autoFocus
            />
            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="Ilość (np. 200g)"
                value={newAmount}
                onChange={e => setNewAmount(e.target.value)}
              />
              <select
                className="input flex-1"
                value={newCat}
                onChange={e => setNewCat(e.target.value)}
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAdd} className="btn-primary flex-1">Dodaj</button>
              <button onClick={() => setShowAddForm(false)} className="btn-ghost flex-1">Anuluj</button>
            </div>
          </div>
        )}
      </div>

      {/* Tip */}
      <div className="text-xs text-gray-600 text-center pb-2">
        💡 Produkty z listy bazowej są ponownie dostępne po kliknięciu „Reset"
      </div>
    </div>
  );
}
