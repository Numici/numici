(function(){
    'use strict';
    
    angular.module('vdvcPublicApp').service('uuidService', uuidService);

    function uuidService() {
        var service = this;

        service.newUuid = newUuid;

        /**
         * Returns a string that is unique a high percentage of the time.
         * @return {string} - UUID. Example: f81d4fae-7dec-11d0-a765-00a0c91e6bf6
         * @see <a href="http://www.ietf.org/rfc/rfc4122.txt">A Universally Unique IDentifier (UUID) URN Namespace</a>
         */
        function newUuid() {

            var s = [];
            var hexDigits = '0123456789abcdef';
            for (var i = 0; i < 36; i++) {
                s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
            }
            s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
            s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
            s[8] = s[13] = s[18] = s[23] = '-';
            return s.join('');
        }
    }
})();