import { useState } from "react"
import * as XLSX from "xlsx"

const PRODUCTS = [
  { name: '小花醬', price: 300 },
  { name: '大花醬', price: 550 },
  { name: '小花茶', price: 380 },
  { name: '大花茶', price: 880 },
  { name: '花瓣', price: 450 },
  { name: '純露', price: 580 },
  { name: '玫瑰粉', price: 1200 },
  { name: '牛奶棒', price: 300 },
  { name: '玫瑰蜂蜜', price: 440 },
  { name: '小禮盒', price: 280 },
  { name: '禮盒', price: 850 },
  { name: '花醬1kg', price: 1500 },
  { name: '花醬糖多1kg', price: 1000 },
  { name: '鮮花', price: 250 },
]

const today = () => new Date().toISOString().slice(0,10)

const labelStyle = { display: 'block', fontSize: 12, color: '#888', marginBottom: 4, marginTop: 14 }
const inputStyle = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }
const btnStyle = { width: '100%', padding: 10, background: '#A0522D', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 16 }
const sectionTitle = { fontSize: 11, fontWeight: 600, color: '#999', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }

export default function App() {
  const [tab, setTab] = useState('sale')
  const [date, setDate] = useState(today())
  const [customerName, setCustomerName] = useState('')
  const [selected, setSelected] = useState({})
  const [prices, setPrices] = useState({})
  const [sales, setSales] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(today().slice(0,7))

  function toggleProduct(name, defaultPrice) {
    setSelected(prev => {
      const next = Object.assign({}, prev)
      if (next[name]) {
        delete next[name]
        const newPrices = Object.assign({}, prices)
        delete newPrices[name]
        setPrices(newPrices)
      } else {
        next[name] = 1
        setPrices(p => ({ ...p, [name]: defaultPrice }))
      }
      return next
    })
  }

  function changeQty(name, delta) {
    setSelected(prev => {
      const next = Object.assign({}, prev)
      const newQty = (next[name] || 1) + delta
      if (newQty <= 0) {
        delete next[name]
        const newPrices = Object.assign({}, prices)
        delete newPrices[name]
        setPrices(newPrices)
      } else {
        next[name] = newQty
      }
      return next
    })
  }

  function submitSale() {
    if (!customerName) { alert('請輸入客戶名稱'); return }
    if (Object.keys(selected).length === 0) { alert('請選擇商品'); return }
    const items = Object.keys(selected).map(name => ({
      name,
      qty: selected[name],
      price: prices[name] || 0
    }))
    const total = items.reduce((sum, i) => sum + i.qty * i.price, 0)
    const record = {
      id: Date.now(),
      date,
      customerName,
      items,
      total
    }
    setSales(prev => [record, ...prev])
    setSelected({})
    setPrices({})
    setCustomerName('')
    alert(`銷售單已建立！總金額 NT$${total}`)
  }

  function deleteSale(id) {
    if (!window.confirm('確定要刪除這筆銷售記錄？')) return
    setSales(prev => prev.filter(s => s.id !== id))
  }

  const monthOptions = Array.from(new Set([
    ...sales.map(s => s.date.slice(0,7)),
    today().slice(0,7)
  ])).sort().reverse()

  const filteredSales = sales.filter(s => s.date.slice(0,7) === selectedMonth)

  function exportExcel() {
    if (filteredSales.length === 0) { alert('本月沒有銷售記錄'); return }

    // 原始記錄
    const rows = []
    filteredSales.forEach(s => {
      s.items.forEach(item => {
        rows.push({
          日期: s.date,
          客戶: s.customerName,
          商品: item.name,
          數量: item.qty,
          單價: item.price,
          小計: item.qty * item.price
        })
      })
    })

    // 彙總表
    const summary = {}
    rows.forEach(r => {
      if (!summary[r.商品]) {
        summary[r.商品] = { 商品: r.商品, 總數量: 0, 總金額: 0 }
      }
      summary[r.商品].總數量 += r.數量
      summary[r.商品].總金額 += r.小計
    })
    const summaryRows = Object.values(summary)
    const grandTotal = summaryRows.reduce((sum, r) => sum + r.總金額, 0)
    summaryRows.push({ 商品: '合計', 總數量: '', 總金額: grandTotal })

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), '原始記錄')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows), '彙總表')
    XLSX.writeFile(wb, `銷售記錄_${selectedMonth}.xlsx`)
  }

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', fontFamily: 'sans-serif', border: '1px solid #eee', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ background: '#A0522D', color: '#FFF8F0', padding: '14px 16px', fontSize: 16, fontWeight: 500 }}>
        🌹 瑰秘食光 銷售系統
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
        {[['sale','🛒 銷售'],['records','📋 記錄']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, padding: '10px 4px', fontSize: 12, border: 'none', cursor: 'pointer',
            background: 'transparent', borderBottom: tab === id ? '2px solid #A0522D' : '2px solid transparent',
            color: tab === id ? '#A0522D' : '#888', fontWeight: tab === id ? 600 : 400
          }}>{label}</button>
        ))}
      </div>

      <div style={{ padding: 16 }}>

        {tab === 'sale' && (
          <div>
            <label style={labelStyle}>日期</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />

            <label style={labelStyle}>客戶名稱</label>
            <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="輸入客戶名稱" style={inputStyle} />

            <label style={labelStyle}>選擇商品</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginTop: 4 }}>
              {PRODUCTS.map(p => (
                <div key={p.name} onClick={() => toggleProduct(p.name, p.price)} style={{
                  padding: '7px 4px', border: selected[p.name] ? '1.5px solid #A0522D' : '1px solid #ddd',
                  borderRadius: 8, fontSize: 12, textAlign: 'center', cursor: 'pointer',
                  background: selected[p.name] ? '#FFF0E6' : 'white',
                  color: selected[p.name] ? '#A0522D' : '#666',
                  fontWeight: selected[p.name] ? 600 : 400
                }}>
                  <div>{p.name}</div>
                  <div style={{ fontSize: 10, color: selected[p.name] ? '#A0522D' : '#aaa' }}>NT${p.price}</div>
                </div>
              ))}
            </div>

            {Object.keys(selected).length > 0 && (
              <div style={{ marginTop: 12, border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
                {Object.keys(selected).map(name => (
                  <div key={name} style={{ padding: '8px 12px', borderBottom: '1px solid #f5f5f5' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button onClick={() => changeQty(name, -1)} style={{ width: 26, height: 26, border: '1px solid #ddd', borderRadius: '50%', background: 'transparent', fontSize: 16, cursor: 'pointer' }}>−</button>
                        <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 600, color: '#A0522D' }}>{selected[name]}</span>
                        <button onClick={() => changeQty(name, 1)} style={{ width: 26, height: 26, border: '1px solid #ddd', borderRadius: '50%', background: 'transparent', fontSize: 16, cursor: 'pointer' }}>+</button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, color: '#888' }}>單價 NT$</span>
                      <input
                        type="number"
                        value={prices[name] || ''}
                        onChange={e => setPrices(p => ({ ...p, [name]: Number(e.target.value) }))}
                        style={{ width: 80, padding: '4px 8px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }}
                      />
                      <span style={{ fontSize: 12, color: '#A0522D', fontWeight: 500 }}>
                        小計 NT${(selected[name] * (prices[name] || 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
                <div style={{ padding: '10px 12px', background: '#FFF8F0', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>總金額</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#A0522D' }}>
                    NT${Object.keys(selected).reduce((sum, name) => sum + selected[name] * (prices[name] || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <button onClick={submitSale} style={btnStyle}>建立銷售單</button>
          </div>
        )}

        {tab === 'records' && (
          <div>
            <label style={labelStyle}>選擇月份</label>
            <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={inputStyle}>
              {monthOptions.map(m => (
                <option key={m} value={m}>{m.slice(0,4)}年{m.slice(5,7)}月</option>
              ))}
            </select>

            <button onClick={exportExcel} style={{...btnStyle, background: '#22a06b'}}>
              📊 匯出銷售記錄 Excel
            </button>

            <div style={{...sectionTitle, marginTop: 16}}>銷售記錄</div>
            {filteredSales.length === 0 && (
              <div style={{ color: '#999', fontSize: 13, textAlign: 'center', padding: 20 }}>本月沒有銷售記錄</div>
            )}
            {filteredSales.map(s => (
              <div key={s.id} style={{ padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{s.customerName}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: '#999' }}>{s.date}</span>
                    <button onClick={() => deleteSale(s.id)} style={{ padding: '2px 8px', fontSize: 11, background: 'transparent', border: '1px solid #ffb3b3', borderRadius: 6, color: '#e53e3e', cursor: 'pointer' }}>刪除</button>
                  </div>
                </div>
                <div style={{ marginBottom: 4 }}>
                  {s.items.map(item => (
                    <span key={item.name} style={{ display: 'inline-block', fontSize: 11, padding: '2px 8px', borderRadius: 99, background: '#FFF0E6', color: '#A0522D', marginRight: 4, marginTop: 3 }}>
                      {item.name} x{item.qty} (NT${item.price})
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#A0522D' }}>總計 NT${s.total.toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}