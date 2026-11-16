import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import ImageCropper from '../../src/components/dashboard/ImageCropper'
import '../../src/index.css'

const mark = (key: string, value: string) => {
  document.body.dataset[key] = value
}

export function Harness() {
  const [file, setFile] = useState<File | null>(null)

  return (
    <div className='p-4'>
      <input
        id='harness-file'
        type='file'
        accept='image/*'
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
      />

      {file && (
        <ImageCropper
          file={file}
          onApply={(croppedFile) => {
            mark('applied', 'true')
            mark('appliedName', croppedFile.name)
            mark('appliedType', croppedFile.type)
            mark('appliedBytes', String(croppedFile.size))
            createImageBitmap(croppedFile).then((bitmap) => {
              mark('appliedWidth', String(bitmap.width))
              mark('appliedHeight', String(bitmap.height))
            })
          }}
          onUseOriginal={() => mark('original', 'true')}
          onCancel={() => {
            mark('cancelled', 'true')
            setFile(null)
          }}
        />
      )}
    </div>
  )
}

createRoot(document.getElementById('mount')!).render(
  <StrictMode>
    <Harness />
  </StrictMode>,
)
