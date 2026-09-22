// src/components/common/SafeHTML.tsx
import { sanitizeHtml } from '../../utils/sanitizeHtml'

export const SafeHTML = ({
  content,
  className,
}: {
  content: string
  className?: string
}) => (
  <div
    className={className}
    dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
  />
)
