import sourceDocument from '../../templates/explore-van-mieu.html?raw'

const bodyMarkup = sourceDocument.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? ''

/**
 * Giữ nguyên cấu trúc của bản thiết kế HTML gốc trong giai đoạn đầu chuyển đổi.
 * Các màn hình có thể được tách dần thành component mà không làm sai lệch giao diện.
 */
function HeritageDocument() {
  return <div dangerouslySetInnerHTML={{ __html: bodyMarkup }} />
}

export default HeritageDocument
