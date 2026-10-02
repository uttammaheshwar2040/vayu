import type { VideoItem } from '../data/demoData'

type VideoCardProps = {
  video: VideoItem
}

export default function VideoCard({ video }: VideoCardProps) {
  return (
    <article className="video-card">
      <p className="video-card__topic">{video.topic}</p>
      <h4>{video.title}</h4>
      <p className="video-card__meta">Published {video.published}</p>
      <p className="video-card__meta">Views: {video.views.toLocaleString()}</p>
      <p className="video-card__meta">Watch time: {video.watchTimeHours.toLocaleString()} hrs</p>
      <p className="video-card__cta">Action: {video.cta}</p>
    </article>
  )
}
