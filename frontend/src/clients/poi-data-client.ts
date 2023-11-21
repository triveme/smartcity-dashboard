import { client } from 'clients/client'

export async function getPois(queryDataId: string) {
  return client
    .get(`/poi/${queryDataId}/`)
    .then((response) => {
      return response.data
    })
    .catch((err) => {
      console.error(err)
    })
}

export async function getAllHauptthemaValues(queryDataId: string) {
  const pois: any[] = await getPois(queryDataId)
  // Extract types values from pois into an array
  const hauptthema = pois.flatMap((poi) => poi.types)
  // Remove duplicates by converting to Set and back to array
  const uniqueHauptthema = Array.from(new Set(hauptthema))
  return uniqueHauptthema
}

export async function getFilteredPois(queryDataId: string, filters: string[]) {
  const filterString = filters.join(',')
  return client
    .get(`/poi/${queryDataId}/?filter=${filterString}`)
    .then((response) => {
      return response.data
    })
    .catch((err) => {
      console.error(err)
    })
}
