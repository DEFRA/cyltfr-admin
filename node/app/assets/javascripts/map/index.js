var $ = require('jquery')
var loadMap = require('./load')
var Maps = require('../../../lib/models/maps')
var maps = new Maps()

$(function () {
  var selected = 'selected'
  var $container = $('.map-container')
  var $sidebar = $('ul.sidebar', $container)
  var $selector = $('select', $container)
  var $categories = $sidebar.children('li.category')
  var $maps = $categories.find('li')

  // Store a reference to the map title element
  var $title = $('h3.lede')

  // Store a reference to the map legend element
  var $legend = $('.legend')

  function setCurrent (ref) {
    maps.setCurrent(ref)

    var currMap = maps.currMap
    var currCategory = maps.currCategory

    // Update the title
    $title.text(currMap.title)

    // Update the legend
    $legend.html(currMap.legend)

    // Update the main nav
    $categories.removeClass(selected)
    $categories.filter('#' + currCategory.ref).addClass(selected)
    $maps.removeClass(selected)
    $maps.filter('#' + currMap.ref).addClass(selected)

    // Update the mobile nav
    $selector.val(currMap.ref)

    // Load the map
    loadMap.showMap('risk:' + currMap.ref.substring(currMap.ref.indexOf('_') + 1))
  }

  // Handle the category header clicks
  $categories.on('click', 'h3', function (e) {
    var $category = $(this).parent()
    if ($category.hasClass(selected)) {
      $category.removeClass(selected)
    } else if ($category.find('.selected').length) {
      $category.addClass(selected)
    } else {
      setCurrent($category.attr('id'))
    }
  })

  // Handle the map selector clicks
  $maps.on('click', function (e) {
    setCurrent($(this).attr('id'))
  })

  // Handle the mobile map selector change
  $selector.on('change', function (e) {
    setCurrent($(this).val())
  })

  // Default to the first category/map
  setCurrent()
})
