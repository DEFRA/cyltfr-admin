module.exports = {
  plugin: {
    name: 'provider',
    register: async (server, options) => {
      const { Provider } = options
      const provider = new Provider()

      // Ensure file exists
      await provider.ensureManifestFile()

      // Expose
      server.expose('provider', provider)

      // Decorate
      server.decorate('server', 'provider', provider)
      server.decorate('request', 'provider', provider)
    }
  }
}
