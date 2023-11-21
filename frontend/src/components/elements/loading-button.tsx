import { useState } from 'react'

import MuiLoadingButton from '@mui/lab/LoadingButton'
import Typography from '@mui/material/Typography'

import { snackActions } from '../../utils/snackbar-utils'

export function LoadingButton(props: any) {
  const [loading, setLoading] = useState(false)
  const { queryFun, queryCompleteFun, queryText, queryColor, style, type, size, fullWidth } = props

  const handleQueryComplete = (res: any) => {
    if (queryCompleteFun) {
      queryCompleteFun(res)
      return
    }
  }

  const handleQueryFun = (e: any) => {
    setLoading(true)
    queryFun(e)
      .then((res: any) => {
        setLoading(false)
        handleQueryComplete(res)
      })
      .catch((err: any) => {
        setLoading(false)
        if (err.response) {
          snackActions.error(err.response.data.message)
          console.error(err.response.data.message)
          return
        }
        snackActions.error(err.toString())
      })
  }

  return (
    <MuiLoadingButton
      loading={loading}
      onClick={handleQueryFun}
      sx={style ? style : null}
      type={type ? type : 'button'}
      size={size ? size : 'medium'}
      fullWidth={fullWidth ? fullWidth : false}
      variant='contained'
      color={queryColor ? queryColor : 'primary'}
    >
      <Typography variant='button' component='div'>
        {queryText}
      </Typography>
    </MuiLoadingButton>
  )
}
