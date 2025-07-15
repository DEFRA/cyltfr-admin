const cache = {}

const setCache = (key, value) => {
  cache[key] = value
}

const getCache = (key) => {
  return cache[key]
}

export { setCache, getCache }
