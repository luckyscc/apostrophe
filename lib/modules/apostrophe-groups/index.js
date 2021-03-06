// Provide a way to group [apostrophe-users](../apostrophe-users/index.html) together
// and assign permissions to them. This module is always active "under the hood," even if
// you take advantage of the `groups` option of `apostrophe-users` to skip a separate
// admin bar button for managing groups.
//
// By default the `published` schema field is removed. As a general rule we believe
// that conflating users and groups, who can log into the website, with public directories
// of people most often leads to confusion. Use a separate subclass of pieces to
// represent departments, etc.
//
// If you do add the `published` field back you will need to extend the cursor to make
// `published(true)` the default again.
//
// This module is **not** intended to be extended with new subclass modules, although
// you may implicitly subclass it at project level to change its behavior.

var _ = require('lodash');

module.exports = {

  alias: 'groups',
  extend: 'apostrophe-pieces',
  name: 'apostrophe-group',
  label: 'Group',
  pluralLabel: 'Groups',
  // Means not included in public sitewide search. -Tom
  searchable: false,
  // You can't give someone permission to edit groups because that
  // allows them to make themselves an admin. -Tom
  adminOnly: true,
  addFields: [
    {
      type: 'joinByArrayReverse',
      name: '_users',
      label: 'Users',
      idsField: 'groupIds',
      withType: 'apostrophe-user',
      ifOnlyOne: true
    },
    {
      type: 'checkboxes',
      name: 'permissions',
      label: 'Permissions',
      // This gets patched at modulesReady time
      choices: []
    }
  ],

  beforeConstruct: function(self, options) {
    options.removeFields = (options.minimumRemoved || [ 'published' ])
      .concat(options.removeFields || []);

    options.removeFilters = [ 'published' ]
      .concat(options.removeFilters || []);
  },

  construct: function(self, options) {

    self.modulesReady = function() {
      self.setPermissionsChoices();
      self.addToAdminBarIfSuitable();
    };

    self.setPermissionsChoices = function() {
      var permissions = _.find(self.schema, { name: 'permissions' });
      if (!permissions) {
        return;
      }
      permissions.choices = self.apos.permissions.getChoices();
    };

    self.addToAdminBar = function() {};

    // Adds an admin bar button if and only if the `apostrophe-users` module
    // is not using its `groups` option for simplified group administration.

    self.addToAdminBarIfSuitable = function() {
      if (self.apos.users.options.groups) {
        // Using the simplified group choice menu, so
        // there is no managing of groups by the end user
      } else {
        self.apos.adminBar.add(self.__meta.name, self.pluralLabel, self.isAdminOnly() ? 'admin' : ('edit-' + self.name), { after: 'apostrophe-users' });
      }
    };

  }

}
