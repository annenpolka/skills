import { h, render } from "preact"
import { useEffect, useMemo, useState } from "preact/hooks"
import htm from "htm"
import { pendingApprovals, simulateDelay } from "./fixtures.js"

const html = htm.bind(h)

function StatusBadge({ status }) {
  const label =
    status === "approved"
      ? "承認済み"
      : status === "rejected"
      ? "却下"
      : "未処理"

  return html`<span class=${`badge badge--${status}`}>${label}</span>`
}

function ListView({ items, onSelect }) {
  return html`
    <section class="panel">
      <div class="panel__header">
        <div>
          <h2>承認待ち一覧</h2>
          <p>もっとも軽い検証用の一覧画面</p>
        </div>
      </div>

      <ul class="card-list">
        ${items.map(
          (item) => html`
            <li class="card" key=${item.id}>
              <div class="card__main">
                <div class="card__title-row">
                  <h3>${item.title}</h3>
                  <${StatusBadge} status=${item.status} />
                </div>
                <p>${item.summary}</p>
                <dl class="meta">
                  <div><dt>申請者</dt><dd>${item.applicant}</dd></div>
                  <div><dt>金額</dt><dd>${item.amount}</dd></div>
                </dl>
              </div>
              <button class="button" onClick=${() => onSelect(item.id)}>
                詳細を見る
              </button>
            </li>
          `
        )}
      </ul>
    </section>
  `
}

function DetailView({ item, onBack, onApprove, onReject }) {
  return html`
    <section class="panel">
      <div class="panel__header">
        <div>
          <h2>申請詳細</h2>
          <p>判断用の最小詳細画面</p>
        </div>
        <button class="button button--secondary" onClick=${onBack}>戻る</button>
      </div>

      <div class="detail">
        <div class="detail__row">
          <span class="detail__label">件名</span>
          <strong>${item.title}</strong>
        </div>
        <div class="detail__row">
          <span class="detail__label">申請者</span>
          <span>${item.applicant}</span>
        </div>
        <div class="detail__row">
          <span class="detail__label">金額</span>
          <span>${item.amount}</span>
        </div>
        <div class="detail__row">
          <span class="detail__label">概要</span>
          <span>${item.summary}</span>
        </div>
        <div class="detail__row">
          <span class="detail__label">状態</span>
          <${StatusBadge} status=${item.status} />
        </div>
      </div>

      <div class="actions">
        <button class="button button--danger" onClick=${() => onReject(item.id)}>
          却下
        </button>
        <button class="button" onClick=${() => onApprove(item.id)}>
          承認
        </button>
      </div>
    </section>
  `
}

function App() {
  const [items, setItems] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    simulateDelay(pendingApprovals, 250).then((data) => {
      setItems(data)
      setIsLoading(false)
    })
  }, [])

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId]
  )

  function updateStatus(id, status) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    )
  }

  if (isLoading) {
    return html`
      <main class="shell">
        <section class="panel">
          <h1>Preact Zero Mock</h1>
          <p class="muted">読み込み中…演出だけ</p>
        </section>
      </main>
    `
  }

  return html`
    <main class="shell">
      <header class="hero">
        <div>
          <h1>Preact Zero Mock</h1>
          <p>ゼロビルドで動く承認フローの最小モック</p>
        </div>
      </header>

      ${
        selectedItem
          ? html`
              <${DetailView}
                item=${selectedItem}
                onBack=${() => setSelectedId(null)}
                onApprove=${(id) => updateStatus(id, "approved")}
                onReject=${(id) => updateStatus(id, "rejected")}
              />
            `
          : html`
              <${ListView}
                items=${items}
                onSelect=${(id) => setSelectedId(id)}
              />
            `
      }
    </main>
  `
}

render(html`<${App} />`, document.getElementById("app"))
