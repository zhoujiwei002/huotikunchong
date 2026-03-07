export default typeof definePageConfig === 'function'
  ? definePageConfig({
      pages: [
        'pages/index/index'
      ],
      window: {
        backgroundTextStyle: 'light',
        navigationBarBackgroundColor: '#fff',
        navigationBarTitleText: '库存管理',
        navigationBarTextStyle: 'black'
      }
    })
  : {
      pages: [
        'pages/index/index'
      ],
      window: {
        backgroundTextStyle: 'light',
        navigationBarBackgroundColor: '#fff',
        navigationBarTitleText: '库存管理',
        navigationBarTextStyle: 'black'
      }
    }
