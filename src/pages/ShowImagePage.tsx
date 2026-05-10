
const ShowImagePage = () => {
  const img_src = [
    'https://i.pinimg.com/736x/1f/01/f2/1f01f2f9519053b1c1457e7fb08aa85b.jpg',
    'https://i.pinimg.com/736x/e1/14/e3/e114e37eb215e8f659f2b03a1d33909f.jpg',
    'https://i.pinimg.com/736x/bc/33/d8/bc33d80b52d7ce136e2e682a7b87e7e1.jpg',
  ]
  return (
    <div>
      {img_src.map((img, index) => {
        return (
          <div className='object-cover flex justify-center sticky top-0'>
            <img src={img} alt={(index + 1).toString()} />
          </div>
        )
      })}
    </div>
  )
}

export default ShowImagePage
