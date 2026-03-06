export const pendingApprovals = [
  {
    id: "req-001",
    title: "経費申請の承認",
    applicant: "三宅 一樹",
    amount: "12,800円",
    status: "pending",
    summary: "展示会の交通費精算"
  },
  {
    id: "req-002",
    title: "ライセンス購入申請",
    applicant: "久野 莉央",
    amount: "24,000円",
    status: "pending",
    summary: "デザインツールの月額更新"
  },
  {
    id: "req-003",
    title: "備品購入申請",
    applicant: "浅海 玲",
    amount: "8,600円",
    status: "approved",
    summary: "配信用マイクの購入"
  }
]

export function simulateDelay(value, ms = 300) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), ms)
  })
}
