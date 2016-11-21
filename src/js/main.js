(function(factory) {

    if (typeof module === 'object' && module.export) {
        module.export = factory()
    } else if (typeof define === 'function' && (define.amd || define.cmd)) {
        define([], factory)
    } else if (typeof window !== 'undefined') {
        window.IndexSidebar = factory()
    }

})(function() {
    var defaultOptions = {
        chars: '*ABCDEFGHIJKLMNOPQRSTUVWXYZ#',
        isAdjust: true, // 是否需要自动调整导航栏高度
        offsetTop: 70,
        offsetBottom: 10,
        lineScale: 0.7,
        charOffsetX: 80,
        charOffsetY: 20
    }

    function IndexSidebar(options) {
        // TODO 处理 options
        options = options || {}

        // 遍历缺省选项逐一处理
        for (var k in defaultOptions) {
            if (defaultOptions.hasOwnProperty(k)) {
                // 未给出选项值时使用缺省选项值
                options[k] = options[k] || defaultOptions[k]
            }
        }

        this.options = options
        this.initialize(options);
    }

    IndexSidebar.prototype.initialize = function(options) {
        // TODO 初始化
        var chars = options.chars
        var el = document.createElement('div')
        el.className = 'index-sidebar-container'
        el.innerHTML = this.render(chars)
        document.body.appendChild(el)

        this.el = el
        this.elChar = el.querySelector('.current-char')
        this.chars = chars
        if (options.isAdjust) {
            this.adjust(options)
        }
        this.initEvents(options)
    }

    IndexSidebar.prototype.render = function(chars) {
        return (
            '<span class="current-char"></span>' +
            '<ul>' + [].map.call(chars, function(ch) {
                return '<li>' + ch + '</li>'
            }).join('') +
            '</ul>'
        )
    }

    IndexSidebar.prototype.adjust = function(options) {
        var charCount = options.chars.length

        var expectHeight = window.innerHeight - options.offsetTop - options.offsetBottom
        var expectLineHeight = expectHeight / charCount
        var expectFontSize = expectLineHeight * options.lineScale

        var style = this.el.querySelector('ul').style
        style.lineHeight = expectLineHeight + 'px'
        style.fontSize = expectFontSize + 'px'
    }

    // 特定事件触发时，调用传入的回调函数并传入事件数据
    IndexSidebar.prototype.on = function(event, callback) {
        // TODO 实现事件监听
        this._listeners = this._listeners || {}
        var listeners = this._listeners[event] || (this._listeners[event] = [])
        listeners.push(callback)
    }

    // 触发特定事件，并给出事件数据供监听的回调函数使用
    IndexSidebar.prototype.trigger = function(event, data) {
        // TODO
        var listeners = this._listeners && this._listeners[event]
        if (listeners) {
            listeners.forEach(function(listener) {
                listener(data)
            })
        }
    }

    // 解除事件监听
    IndexSidebar.prototype.off = function(event, callback) {
        // TODO
        var listeners = this._listeners && this._listeners[event]
        if (listeners) {
            var i = listeners.indexOf(callback)
            if (i > -1) {
                listeners.splice(i, 1)
                if (listeners.length === 0) {
                    this._listeners[event] = null
                }
            }
        }
    }

    IndexSidebar.prototype.initEvents = function(options) {
        var view = this
        var el = this.el
        var elChar = this.elChar
        var chars = this.chars

        var boxRect = el.getBoundingClientRect()
        var boxHeight = boxRect.height
        var boxClientTop = boxRect.top

        var charOffsetX = options.charOffsetX
        var charOffsetY = options.charOffsetY

        var touching = false
        var lastChar

        // touch events
        if ('ontouchstart' in document) {
            el.addEventListener('touchstart', function(e) {
                if (!touching) {
                    e.preventDefault()
                    var t = e.touches[0]
                    start(t.clientX, t.clientY)
                }
            }, false)
            document.addEventListener('touchmove', function handler(e) {
                if (touching) {
                    e.preventDefault()
                    var t = e.touches[0]
                    move(t.clientX, t.clientY)
                }
            }, false)
            document.addEventListener('touchend', function(e) {
                if (touching) {
                    e.preventDefault()
                    end()
                }
            }, false)
        }
        // mouse events
        else {
            el.addEventListener('mousedown', function(e) {
                if (!touching) {
                    e.preventDefault()
                    start(e.clientX, e.clientY)
                }
            })
            document.addEventListener('mousemove', function(e) {
                if (touching) {
                    e.preventDefault()
                    move(e.clientX, e.clientY)
                }
            })
            document.addEventListener('mouseup', function(e) {
                if (touching) {
                    e.preventDefault()
                    end()
                }
            })
        }

        function start(clientX, clientY) {
            touching = true
            elChar.style.display = 'block'
            move(clientX, clientY)
        }

        function move(clientX, clientY) {
            var offset = calcRelativePosition(clientY)
            var percent = offset / boxHeight
            var ch = getPositionChar(percent)

            updateChar(clientX, clientY, ch)
        }

        function end() {
            touching = false
            elChar.style.display = 'none'
        }

        function updateChar(clientX, clientY, ch) {
            var x = Math.max(clientX, charOffsetX)
            var yMin = boxClientTop
            var yMax = window.innerHeight - charOffsetY
            var y = Math.min(Math.max(clientY, yMin), yMax)

            elChar.textContent = ch
            elChar.style.left = x + 'px'
            elChar.style.top = y + 'px'

            if (ch && lastChar !== ch) {
                lastChar = ch
                view.trigger('charChange', ch)
            }
        }

        function calcRelativePosition(clientY) {
            var y = clientY - boxClientTop
            if (y < 0) {
                y = 0
            } else if (y > boxHeight) {
                y = boxHeight
            }
            return y
        }

        // yPercent {Number} in range of [0, 1]
        function getPositionChar(yPercent) {
            var min = 1
            var max = chars.length
            var index = Math.ceil(yPercent * max)
            if (index < min) {
                index = min
            } else if (index > max) {
                index = max
            }
            return chars[index - 1]
        }
    }


    // 内容列表组件
    function ItemList(data) {
        var list = []
        var map = {}
        var html

        html = data.map(function(item) {
            // 数组中每项为 "Angola 安哥拉" 的形式，且已排序
            var i = item.lastIndexOf(' ')
            var en = item.slice(0, i)
            var cn = item.slice(i + 1)
            var ch = en[0]
            if (map[ch]) {
                return '<li>' + en + '<br>' + cn + '</li>'
            } else {
                // 同一索引字符首次出现时，在 HTML 上标记
                map[ch] = true
                return '<li data-ch="' + ch + '">' + en + '<br>' + cn + '</li>'
            }
        }).join('')

        var elItemList = document.querySelector('#item-container ul')
        elItemList.innerHTML = html

        return {
            gotoChar: function(ch) {
                // TODO 实现按索引字符跳转功能
                if (ch === '*') {
                    // 滚动至顶部
                    elItemList.scrollTop = 0
                } else if (ch === '#') {
                    // 滚动至底部
                    elItemList.scrollTop = elItemList.scrollHeight
                } else {
                    // 滚动至特定索引字符处
                    var target = elItemList.querySelector('[data-ch="' + ch + '"]')
                    if (target) {
                        target.scrollIntoView()
                    }
                }
            }
        }
    }
    return IndexSidebar;
});
