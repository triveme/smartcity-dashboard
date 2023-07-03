import { client } from 'clients/client'

export async function getCollections() {
  return client
    .get('/wizard/collections')
    .then((response) => {
      return response.data
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function getSourcesForCollection(args: string) {
  return client
    .get('/wizard/sources?', {
      params: {
        collection: args,
      },
    })
    .then((response) => {
      return response.data
    })
    .catch((err) => {
      console.log(err)
    })
}

export type DateConfigRequestType = {
  collection: string
  source: string
  attribute?: string
}

export async function getAttributeForSource(args: DateConfigRequestType) {
  // console.log("getAttributeForSource");
  return client
    .get('/wizard/attributes?', {
      params: {
        collection: args.collection,
        source: args.source,
      },
    })
    .then((response) => {
      return response.data
    })
    .catch((err) => {
      console.log(err)
    })
}

export async function getSensorsForSource(args: DateConfigRequestType) {
  // console.log("getSensorsForSource");
  return client
    .get('/wizard/sensors?', {
      params: {
        collection: args.collection,
        source: args.source,
        attribute: args.attribute,
      },
    })
    .then((response) => {
      return response.data
    })
    .catch((err) => {
      console.log(err)
    })
}
