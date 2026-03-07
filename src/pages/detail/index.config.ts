export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '昆虫详情',
      navigationBarBackgroundColor: '#ffffff',
      navigationBarTextStyle: 'black'
    })
  : {
      navigationBarTitleText: '昆虫详情',
      navigationBarBackgroundColor: '#ffffff',
      navigationBarTextStyle: 'black'
    }
