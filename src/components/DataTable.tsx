import type { VideoItem } from '../data/demoData'

type DataTableProps = {
  rows: VideoItem[]
}

export default function DataTable({ rows }: DataTableProps) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Topic</th>
            <th>Published</th>
            <th>Views</th>
            <th>Watch Time</th>
            <th>Next Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.title}>
              <td>{row.title}</td>
              <td>{row.topic}</td>
              <td>{row.published}</td>
              <td>{row.views.toLocaleString()}</td>
              <td>{row.watchTimeHours.toLocaleString()} hrs</td>
              <td>{row.cta}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
