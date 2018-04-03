const sketch = require('sketch')
const UI = require('sketch/ui')
const fetch = require('sketch-polyfill-fetch')

// 让用户输入连接
function confirmLink (callback) {
  const link = UI.getStringFromUser("请输入主题链接", 'https://m.okjike.com/topics/56e3e4a2b227d41100fe5dba')
  const topicId = link.split('topics/')[1].split('?')[0]
  fetchFeed(topicId, callback)
}
// 获取信息流
function fetchFeed (topicId, callback) {
  fetch(
    "https://app.jike.ruguoapp.com/1.0/messages/history",
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: {
        "limit": 20,
        "loadMoreKey": null,
        "topic": topicId || "57079a1526b0ab12002c29da"
      }
    }
  )
  .then(response => response.json())
  .then(results => {
    // console.log(results.data.map(d => d.content).join(','))
    callback && callback(results)
  })
  .catch(e => console.error(e))
}

// 画出卡片
function drawCard (parent, data, y) {
  const text = new sketch.Text({
    name: 'content',
    text: data.content,
    frame: {
      x: 15,
      y: 10,
      width: 345
    },
    fixedWidth: true
  })
  const shape = new sketch.Shape({
    name: 'content-bg',
    frame: {
      width: 375,
      height: text.frame.height + 20
    }
  })
  const shapeDivider = new sketch.Shape({
    name: 'content-divider',
    frame: {
      y: 0,
      width: 375,
      height: 1
    },
    style: {
      fills: [
        {
          color: '#DDD',
          fillType: sketch.Style.FillType.color,
        }
      ],
      borders: []
    }
  })
  const group = new sketch.Group({
    name: 'card',
    parent,
    frame: {
      x: 0,
      y
    }
  })
  if (y !== 0) {
    group.layers = [shape, text, shapeDivider]
  } else {
    group.layers = [shape, text]
  }
  group.adjustToFit()
  return group
}
// 画出 feed 流
function drawFeed (document, results) {
  const page = document.selectedPage
  const artboard = new sketch.Artboard({
    parent: page,
    name: 'feed-artboard',
    frame: {
      x: 0,
      y: 0,
      width: 375,
      height: 667
    }
  })
  let group, y = 0, artboardHeight = 0
  results.data.map((data, index) => {
    y = index === 0 ? 0 : y + group.frame.height
    group = drawCard(artboard, data, y)
    artboardHeight = artboardHeight + group.frame.height
    artboard.frame = {x: 0, y: 0, width: 375, height: artboardHeight }
  })

  // text.adjustToFit()
  document.centerOnLayer(artboard)
}

export default function(context) {
  const document = sketch.fromNative(context.document)

  confirmLink(results => {
    const feedArtboards = document.getLayersNamed('feed-artboard')
    if (feedArtboards.length) {
      feedArtboards[0].remove()
    }
    drawFeed(document, results)
  })
}
