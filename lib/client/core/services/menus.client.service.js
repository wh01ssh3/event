'use strict';

((angular) => {
  angular
    .module('core')
    .service('Menus', Menus);

  function Menus() {
    this.menus = {};

    let shouldRender = function (user) {
      return true;
    };

    this.validateMenuExistance = (menuId) => {
      if (!(menuId && menuId.length)) {
        throw new Error('MenuId was not provided');
      } else if (!this.menus[menuId]) {
        throw new Error('Menu does not exist');
      }
      return true;
    };

    this.getMenu = (menuId) => {
      this.validateMenuExistance(menuId);
      return this.menus[menuId];
    };

    this.addMenu = (menuId, options = {}) => {
      this.menus[menuId] = {
        items: options.items || [],
        shouldRender: shouldRender
      };
      return this.menus[menuId];
    };

    this.removeMenu = (menuId) => {
      this.validateMenuExistance(menuId);
      delete this.menus[menuId];
    };

    this.addMenuItem = (menuId, options = {}) => {
      this.validateMenuExistance(menuId);

      this.menus[menuId].items.push({
        title: options.title || '',
        state: options.state || '',
        type: options.type || 'item',
        'class': options.class,
        icon: options.icon || '',
        position: options.position || 0,
        items: [],
        shouldRender: shouldRender
      });

      if (options.items) {
        options.items.map((item) => {
          this.addSubMenuItem(menuId, options.state, item);
        });
      }

      return this.menus[menuId];
    };

    this.addSubMenuItem = (menuId, parentItemState, options = {}) => {
      this.validateMenuExistance(menuId);

      this.menus[menuId].items.map((itemIndex) => {
        if (itemIndex.hasOwnProperty('state') || itemIndex.state === parentItemState) {
          itemIndex.items.push({
            title: options.title || '',
            state: options.state || '',
            position: options.position || 0,
            shouldRender: shouldRender
          });
        }
      });

      return this.menus[menuId];
    };

    this.removeMenuItem = (menuId, menuItemState) => {
      this.validateMenuExistance(menuId);

      this.menus[menuId].items.map((itemIndex) => {
        if (itemIndex.state === menuItemState) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      });

      return this.menus[menuId];
    };

    this.removeSubMenuItem = (menuId, submenuItemState) => {
      this.validateMenuExistance(menuId);

      this.menus[menuId].items.map((itemIndex) => {
        itemIndex.items.map((subitemIndex) => {
          if (subitemIndex.state === submenuItemState) {
            itemIndex.items.splice(subitemIndex, 1);
          }
        });
      });

      return this.menus[menuId];
    };

    this.addMenu('topbar');
  }
})(window.angular);
