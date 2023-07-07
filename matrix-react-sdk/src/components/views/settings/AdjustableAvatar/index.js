import React, { useState, useCallback, useEffect } from 'react'
import Cropper from 'react-easy-crop'
import Slider from '@material-ui/core/Slider'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
// import ImgDialog from './ImgDialog'
import getCroppedImg from './cropImage'
// import LoadingScreen from '../../rooms/LoadingScreen';
// import loadingLottie from "../../../../../res/img/cafeteria-loading-regular.json";

const AdjustableAvatar = props => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const getImage = useCallback(async () => {
    try {
      const [croppedImage, ImgDate] = await getCroppedImg(
        props.url,
        croppedAreaPixels,
        rotation
      )
      console.log('donee', { croppedImage })
      props.setCroppedImage(croppedImage, ImgDate);
      props.clickCloseModal()
    } catch (e) {
      console.error(e)
    }
  }, [croppedAreaPixels, rotation])

  const cancelDialog = () => {
    props.clickCloseModal();
  }

  return (
    <div className='mx_AdjustableAvatar_container'>
      <div className='mx_AdjustableAvatar_cropper'>
        <Cropper
          image={props.url}
          crop={crop}
          rotation={rotation}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onRotationChange={setRotation}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
          showGrid={false}
          cropShape="round"
        />        
      </div>
      <div className='mx_AdjustableAvatar_controls'>
        <div className='mx_AdjustableAvatar_tool zoom'>
          <Typography
            variant="overline"
            className='mx_AdjustableAvatar_label'
          >
            Zoom
          </Typography>
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            className='mx_AdjustableAvatar_slider'
            onChange={(e, zoom) => setZoom(zoom)}
          />
        </div>
        <div className='mx_AdjustableAvatar_tool rotate'>
          <Typography
            variant="overline"
            className='mx_AdjustableAvatar_label'
          >
            Rotation
          </Typography>
          <Slider
            value={rotation}
            min={0}
            max={360}
            step={1}
            aria-labelledby="Rotation"
            className='mx_AdjustableAvatar_slider'
            onChange={(e, rotation) => setRotation(rotation)}
          />
        </div>
        <div className='mx_AdjustableAvatar_button_group'>
          <Button
            onClick={getImage}
            variant="contained"
            className='mx_AdjustableAvatar_button save'
          >
            Save
          </Button>
          <Button
            onClick={cancelDialog}
            variant="contained"
            className='mx_AdjustableAvatar_button cancel'
          >
            Cancel
          </Button>
        </div>
      </div>
      
    </div>
  )
}

export default AdjustableAvatar
