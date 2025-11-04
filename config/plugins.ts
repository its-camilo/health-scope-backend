export default () => ({
  'users-permissions': {
    config: {
      register: {
        allowedFields: ['username', 'email', 'password'],
      },
      email: {
        confirmation: {
          enabled: false,
        },
      },
    },
  },
});
