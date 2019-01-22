export default [{
  path: '/',
  redirect: '/goods'
}, {
  path: '/goods',
  component: () => import('components/goods/goods')
}, {
  path: '/ratings',
  component: () => import('components/ratings/ratings')
}, {
  path: '/seller',
  component: () => import('components/seller/seller')
}]
