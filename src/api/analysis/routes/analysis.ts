export default {
  routes: [
    {
      method: 'POST',
      path: '/analysis/run',
      handler: 'analysis.run',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/analysis/reset',
      handler: 'analysis.reset',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
