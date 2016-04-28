var mapTests = require('../../common/map')
var data = require('./data.js')
module.exports = {
  'beforeEach': function (client) {
    // Force browser to pretendo-mobile
    // client.resizeWindow(300, 600)
  },
  'native-functionality': function (client) {
    var mapPage = client.page.map()

    // this is independent of mobile

    // load the map with no parameters
    mapTests.loadPageNoParams(mapPage)

    mapTests.assertZoomIs(client, mapPage, 0)

    mapPage.zoomIn(client, 10)

    mapTests.assertZoomIs(client, mapPage, 10)

    mapPage.zoomOut(client, 10)

    mapTests.assertZoomIs(client, mapPage, 0)

    mapPage.toggleFullscreen()

    // TODO assert is full screen?

    client.pause(2000)

    mapPage.toggleFullscreen()

    // try some panning
    //
    // rotation allowed etc?

    client.end()
  },
  'layer-selection-desktop': function (client) {
    var mapPage = client.page.map()

    data.addresses.forEach(function (item) {
      // load map with a type
      mapTests.loadPageWithParams(mapPage, item.addressId, item.easting, item.northing)

      // assert that the return to risk page with address link is hidden
      mapTests.assertRiskAddressVisible(mapPage)

      mapTests.assertZoomIs(client, mapPage, 9)

      // assert centre point is correctly
      mapTests.assertCentreIs(client, mapPage, [item.easting, item.northing])

      mapTests.assertMapSelectedAndLoaded(client, mapPage, data.mapTypes[0].maps[0].ref)

      mapPage.isMobile(function (isMobile) {
        // assert we have the correct map visible
        mapTests.assertMapSelectedAndLoaded(client, mapPage, data.mapTypes[0].maps[0].ref)
        mapTests.assertMapNotSelected(mapPage, data.mapTypes[1].maps[0].id, isMobile)
        mapTests.assertMapNotSelected(mapPage, data.mapTypes[2].maps[0].id, isMobile)

        // select each map from basic view
        data.mapTypes.forEach(function (item) {
          mapPage.selectMap(item.maps[0].id, isMobile)

          mapTests.assertMapSelectedAndLoaded(client, mapPage, item.maps[0].ref)

          // check others not selected
          data.mapTypes.forEach(function (i) {
            if (i !== item) {
              mapTests.assertMapNotSelected(mapPage, i.maps[0].id, isMobile)
            }
          })
        })

        if (!isMobile) {
          // assert is basic view
          mapTests.assertIsBasicView(mapPage)
          // switch to advanced view
          mapPage.toggleDetailed()
          // assert detailed view visible
          mapTests.assertIsDetailedView(mapPage)
        }

        // select each map from advanced view
        data.mapTypes.forEach(function (item) {
          item.maps.forEach(function (i) {
            // click the map child
            mapPage.selectMap(i.id, isMobile)

            mapTests.assertMapSelectedAndLoaded(client, mapPage, i.ref)
          })
        })

        if (!isMobile) {
          // return to basic view
          mapPage.toggleDetailed()
          mapTests.assertIsBasicView(mapPage)
        }
      })
    })

    client.end()
  },
  'parameterised-map-with-type': function (client) {
    data.mapTypes.forEach(function (item) {
      var mapPage = client.page.map()

      // load map with a type
      mapTests.loadPageWithParams(mapPage, data.addresses[0].addressId, data.addresses[0].easting, data.addresses[0].northing, item.ref)

      // assert risk address link visible
      mapTests.assertRiskAddressVisible(mapPage)

      // assert localised zoom
      mapTests.assertZoomIs(client, mapPage, 9)

      // assert we have the correct map visible
      mapTests.assertMapSelectedAndLoaded(client, mapPage, item.maps[0].ref)
    })

    client.end()
  }
}
