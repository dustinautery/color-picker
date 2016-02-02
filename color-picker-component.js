(function(){
    'use strict';

    angular.module('colorPicker', [])
        .directive('colorPicker', [function () {

            var updateEventListenerTargets = ['touchstart','touchmove','mouseup','mousemove'],
                clientX, clientY,
                mousedown = 0;

            function ColorPicker() {
                // Initialize at center position with white
                this.ngModel = '#ffffff';
            }

            ColorPicker.$inject = [];

            return {
                restrict: 'E',
                controller: ColorPicker,
                bindToController: true,
                controllerAs: 'colorPicker',
                scope: {
                    ngModel: '=color'
                },
                replace: true,
                template: [
                    '<div class="color-picker">',
                        '<canvas width="230px" height="230px"></canvas>',
                        '<span class="indicator">',
                            '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="50" height="64" viewBox="0 0 25 32">',
                                '<path fill="#ffffff" d="M12.528 0c-6.943 0-12.528 5.585-12.528 12.528 0 10.868 12.528 19.472 12.528 19.472s12.528-9.585 12.528-18.792c0-6.868-5.66-13.208-12.528-13.208zM12.528 21.434c-4.981 0-9.057-4.075-9.057-9.057s4.075-9.057 9.057-9.057 9.057 4.075 9.057 9.057-4.075 9.057-9.057 9.057z"></path>',
                            '</svg>',
                            '<span class="selected-color"></span>',
                        '</span>',
                    '</div>'
                ].join(''),
                link: function (scope, el, attrs, colorPicker) {

                    var canvas = el.find('canvas')[0];

                    var context = canvas.getContext('2d');
                    var x = canvas.width / 2;
                    var y = canvas.height / 2;
                    var radius = x;
                    var counterClockwise = false;

                    for(var angle=0; angle<=360; angle+=1){
                        var startAngle = (angle-2)*Math.PI/180;
                        var endAngle = angle * Math.PI/180;

                        context.beginPath();
                        context.moveTo(x, y);
                        context.arc(x, y, radius, startAngle, endAngle, counterClockwise);
                        context.closePath();

                        var gradient = context.createRadialGradient(x, y, 0, x, y, radius);
                            gradient.addColorStop(0,'hsl('+angle+', 10%, 100%)');
                            gradient.addColorStop(1,'hsl('+angle+', 100%, 50%)');

                        context.fillStyle = gradient;
                        context.fill();
                    }

                    var updateColorPicker = function(e){
                        e.preventDefault();

                        if (e.type === 'mousemove' && !mousedown) { return; }

                        clientX = (e.clientX) ? e.clientX : e.changedTouches[0].clientX;
                        clientY = (e.clientY) ? e.clientY : e.changedTouches[0].clientY;

                        var canvasOffset = canvas.getBoundingClientRect();
                        var canvasX = Math.floor(clientX - canvasOffset.left);
                        var canvasY = Math.floor(clientY - canvasOffset.top);

                        // get current pixel
                        var imageData = context.getImageData(canvasX, canvasY, 1, 1);
                        var pixel = imageData.data;

                        var indicator = el.find('span')[0];
                        var selectedColor = indicator.getElementsByClassName('selected-color')[0];

                        if(!pixel[pixel.length - 1]) {
                            return;
                        }

                        var dColor = pixel[2] + 256 * pixel[1] + 65536 * pixel[0];

                        colorPicker.ngModel = '#' + ('0000' + dColor.toString(16)).substr(-6);

                        indicator.style.left    = canvasX + 'px';
                        indicator.style.top     = canvasY - 32 + 'px';
                        selectedColor.style.backgroundColor = colorPicker.ngModel;

                        scope.$apply(function(){
                            colorPicker.ngModel = colorPicker.ngModel;
                        });

                    };

                    for (var i=0, len = updateEventListenerTargets.length; i<len; i++) {
                        canvas.addEventListener(updateEventListenerTargets[i], updateColorPicker, false);
                    }

                    canvas.addEventListener('mousedown', function(){
                        mousedown = 1;
                    }, false);

                    document.addEventListener('mouseup', function(){
                        mousedown = 0;
                    }, false);
                }
            };
        }]);
}());
