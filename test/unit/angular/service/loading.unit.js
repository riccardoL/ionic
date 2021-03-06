describe('$ionicLoading service', function() {
  beforeEach(module('ionic'));
  it('should reuse loader instance for getLoader', inject(function($ionicLoading) {
    var loader = TestUtil.unwrapPromise($ionicLoading._getLoader());
    var loader2 = TestUtil.unwrapPromise($ionicLoading._getLoader());
    expect(loader).toBe(loader2);
  }));

  describe('loader instance', function() {

    describe('.show()', function() {

      it('should retain backdrop if !noBackdrop and !isShown', inject(function($ionicLoading, $ionicBackdrop) {
        spyOn($ionicBackdrop, 'retain');
        var loader = TestUtil.unwrapPromise($ionicLoading._getLoader());
        loader.show({})
        expect($ionicBackdrop.retain).toHaveBeenCalled();
      }));
      it('should not retain backdrop if noBackdrop', inject(function($ionicLoading, $ionicBackdrop) {
        spyOn($ionicBackdrop, 'retain');
        var loader = TestUtil.unwrapPromise($ionicLoading._getLoader());
        loader.show({ noBackdrop: true })
        expect($ionicBackdrop.retain).not.toHaveBeenCalled();
      }));
      it('should not retain backdrop if isShown', inject(function($ionicLoading, $ionicBackdrop) {
        spyOn($ionicBackdrop, 'retain');
        var loader = TestUtil.unwrapPromise($ionicLoading._getLoader());
        loader.isShown = true;
        loader.show({})
        expect($ionicBackdrop.retain).not.toHaveBeenCalled();
      }));

      it('should not timeout if no duration', inject(function($ionicLoading, $timeout) {
        var loader = TestUtil.unwrapPromise($ionicLoading._getLoader());
        loader.show({});
        expect(loader.durationTimeout).toBeFalsy();
      }));
      it('should timeout if duration', inject(function($ionicLoading, $timeout) {
        var loader = TestUtil.unwrapPromise($ionicLoading._getLoader());
        loader.show({ duration: 1000 });
        expect(loader.durationTimeout).toBeTruthy();
        expect(loader.durationTimeout.$$timeoutId).toBeTruthy();
      }));
      it('should add active', inject(function($ionicLoading, $timeout) {
        var loader = TestUtil.unwrapPromise($ionicLoading._getLoader());
        ionic.requestAnimationFrame = function(cb) { cb(); };
        expect(loader.element.hasClass('active')).toBe(false);
        loader.show({});
        $timeout.flush();
        expect(loader.element.hasClass('active')).toBe(true);
      }));
      it('should isShown = true', inject(function($ionicLoading) {
        var loader = TestUtil.unwrapPromise($ionicLoading._getLoader());
        expect(loader.isShown).toBeFalsy();
        loader.show({});
        expect(loader.isShown).toBe(true);
      }));

      it('should use options.template', inject(function($ionicLoading, $rootScope) {
        var loader = TestUtil.unwrapPromise($ionicLoading._getLoader());
        loader.show({ template: 'foo {{"bar"}}' });
        $rootScope.$apply();
        expect(loader.element.text()).toBe('foo bar');
      }));

      it('should use options.templateUrl', inject(function($ionicLoading, $rootScope, $ionicTemplateLoader, $q) {
        spyOn($ionicTemplateLoader, 'load').andReturn($q.when('{{1}} content'));
        var loader = TestUtil.unwrapPromise($ionicLoading._getLoader());
        loader.show({ templateUrl: 'template.html' });
        expect($ionicTemplateLoader.load).toHaveBeenCalledWith('template.html');
        $rootScope.$apply();
        expect(loader.element.text()).toBe('1 content');
      }));

    });

    describe('.hide()', function() {

      it('should release backdrop if hasBackdrop and isShown', inject(function($ionicLoading, $ionicBackdrop) {
        spyOn($ionicBackdrop, 'release');
        var loader = TestUtil.unwrapPromise($ionicLoading._getLoader());
        loader.isShown = true;
        loader.hasBackdrop = true;
        loader.hide();
        expect($ionicBackdrop.release).toHaveBeenCalled();
      }));
      it('should not release backdrop if !hasBackdrop', inject(function($ionicLoading, $ionicBackdrop) {
        spyOn($ionicBackdrop, 'release');
        var loader = TestUtil.unwrapPromise($ionicLoading._getLoader());
        loader.isShown = true;
        loader.hide();
        expect($ionicBackdrop.release).not.toHaveBeenCalled();
      }));
      it('should cancel durationTimeout and set isShown to false', inject(function($ionicLoading, $timeout) {
        spyOn($timeout, 'cancel');
        var loader = TestUtil.unwrapPromise($ionicLoading._getLoader());
        loader.durationTimeout = {};
        loader.isShown = true;
        loader.hide({});
        expect($timeout.cancel).toHaveBeenCalledWith(loader.durationTimeout);
        expect(loader.isShown).toBe(false);
      }));

    });

    it('should show with options', inject(function($ionicLoading, $timeout) {
      var loader = TestUtil.unwrapPromise($ionicLoading._getLoader());
      spyOn(loader, 'show');
      var options = {};
      $ionicLoading.show(options);
      $timeout.flush();
      expect(loader.show).toHaveBeenCalledWith(options);
    }));

    it('should $timeout.cancel & hide', inject(function($ionicLoading, $rootScope, $timeout) {
      var loader = TestUtil.unwrapPromise($ionicLoading._getLoader());
      spyOn($timeout, 'cancel');
      spyOn(loader, 'hide');
      $ionicLoading.hide();
      expect($timeout.cancel).toHaveBeenCalled();
      $rootScope.$apply();
      expect(loader.hide).toHaveBeenCalled();
    }));

    it('hide should cancel show delay and just go ahead and hide', inject(function($ionicLoading, $timeout) {
      ionic.requestAnimationFrame = function(cb) { cb(); };
      var loader = TestUtil.unwrapPromise($ionicLoading._getLoader());
      spyOn(loader, 'hide').andCallThrough();
      spyOn(loader, 'show').andCallThrough();
      $ionicLoading.show({ delay: 1000 });
      $ionicLoading.hide();
      expect(loader.show).not.toHaveBeenCalled();
      expect(loader.hide).not.toHaveBeenCalled();
      $timeout.flush();
      expect(loader.show).not.toHaveBeenCalled();
      expect(loader.hide).toHaveBeenCalled();
      expect(loader.isShown).toBe(false);
      expect(loader.element.hasClass('active')).toBe(false);
    }));
    it('show should only active after raf is still isShown', inject(function($ionicLoading) {
      var loader = TestUtil.unwrapPromise($ionicLoading._getLoader());
      var rafCallback;
      ionic.requestAnimationFrame = function(cb) {
        rafCallback = cb;
      };
      loader.show({});
      expect(loader.isShown).toBe(true);
      loader.hide();
      expect(loader.isShown).toBe(false);
      rafCallback();
      expect(loader.element.hasClass('active')).toBe(false);
      ionic.requestAnimationFrame = function(cb) { cb(); };
    }));

  });
});
