; (function() {
	'use strict';

	angular.module("vdvcApp").directive("copyAsFormatted", CopyAsFormatted);
	angular.module("vdvcApp").controller("CopyAsFormattedController", CopyAsFormattedController);


	CopyAsFormatted.$inject = ['_', '$state', '$timeout'];
	CopyAsFormattedController.$inject = ['$scope', '_', '$timeout', '$state'];

	function CopyAsFormattedController($scope, _, $timeout, $state) {
		var timeout;
		
		$scope.$on("$destroy", function handleDestroyEvent() {
			$timeout.cancel(timeout);
		});


		function initEditor() {
			try {
				$scope.editor = CKEDITOR.replace('digestMail', {
					readOnly: false,
					tabSpaces: 4,
					width: "calc(100% - 2px)",
					height: 400,
					uiColor: '#ffffff',
					language: "en",
					skin: 'moono-lisa,/resources/js/ckeditor/skins/moono-lisa/',
					resize_enabled: false,
					removePlugins: "stylesheetparser, elementspath, magicline",
					fullPage: true,
					autoParagraph: false,
					toolbarGroups: [
						{ name: 'document', groups: ['mode', 'document', 'doctools'] },
						{ name: 'clipboard', groups: ['clipboard', 'undo'] },
						{ name: 'editing', groups: ['find', 'selection', 'spellchecker', 'editing'] },
						{ name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
						{ name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi', 'paragraph'] },
						{ name: 'forms', groups: ['forms'] },
						{ name: 'links', groups: ['links'] },
						{ name: 'insert', groups: ['insert'] },
						{ name: 'styles', groups: ['styles'] },
						{ name: 'colors', groups: ['colors'] },
						{ name: 'tools', groups: ['tools'] },
						{ name: 'others', groups: ['others'] },
						{ name: 'about', groups: ['about'] }
					],
					removeButtons: 'Source,Save,NewPage,Templates,Print,Preview,Find,Replace,SelectAll,Scayt,Form,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,CreateDiv,BidiLtr,BidiRtl,Language,Subscript,Superscript,CopyFormatting,Checkbox,Anchor,Image,Flash,Table,HorizontalRule,Smiley,SpecialChar,PageBreak,Iframe,Styles,Maximize,ShowBlocks,About,Font,RemoveFormat,PasteFromWord,PasteText,Format,Blockquote'
				});
			} catch (e) {

			}
			if ($scope.editor) {
				$scope.editor.on('instanceReady', function(evt) {
					$scope.editor.document.$.body.innerHTML = "<br>" + angular.copy($scope.copyContent.content);
					if ($state.current.name == "sharelinks" || $state.current.name == "taskspace.list.task") {
						var copyContentCss = {
							"width": "calc(100% - 30px)",
							"padding": "15px",
							"margin": "0px"
						};
						var iframe = $("#cke_digestMail").find("iframe");
						if(iframe && iframe.length>0) {
							$("#cke_digestMail").find('iframe').css({"height": "calc(100% - 2px)"});
						}
						$($scope.editor.document.$.body).css(copyContentCss);
					}
					timeout = $timeout(function() {
						$scope.showLoader = false;
					}, 10);
					var timer = $timeout(function() {
						if($scope.editor.document.$.body) {
							$($scope.editor.document.$.body).find('.cke_widget_drag_handler_container').css("display", "none");
							$($scope.editor.document.$.body).find('.cke_image_resizer').css("display", "none");
						}
						$timeout.cancel(timer);
			        }, 2000);
				});
			}
		}

		initEditor();

	}

	function CopyAsFormatted(_, $state, $timeout) {

		var template = '<textarea id="digestMail"\
					style="display: none; width: 0px; overflow: auto; position: absolute; top: -500px;"\
					data-focus-on="focusContent">\
				</textarea>';
		return {
			restrict: 'E',
			scope: {
				copyContent: "=",
				showLoader: "=",
				editor: "=",
				focusContent: "="
			},
			controller: CopyAsFormattedController,
			template: template,
		};
	}

})();