/* Standard CKeditor tips for non compatible browsers
   Must be i18nized */


if ( typeof console != 'undefined' )
	console.log();


if ( window.CKEDITOR )
{
	(function()
	{
		var showCompatibilityMsg = function()
		{
			var env = CKEDITOR.env;

			var html = '<p><strong>Your browser is not compatible with CKEditor.</strong>';

			var browsers =
			{
				gecko : 'Firefox 2.0',
				ie : 'Internet Explorer 6.0',
				opera : 'Opera 9.5',
				webkit : 'Safari 3.0'
			};

			var alsoBrowsers = '';

			for ( var key in env )
			{
				if ( browsers[ key ] )
				{
					if ( env[key] )
						html += ' CKEditor is compatible with ' + browsers[ key ] + ' or higher.';
					else
						alsoBrowsers += browsers[ key ] + '+, ';
				}
			}

			alsoBrowsers = alsoBrowsers.replace( /\+,([^,]+), $/, '+ and $1' );

			html += ' It is also compatible with ' + alsoBrowsers + '.';

			html += '</p><p>With non compatible browsers, you should still be able to see and edit the contents (HTML) in a plain text field.</p>';

			document.getElementById( 'alerts' ).innerHTML = html;
		};

		var onload = function()
		{
			// Show a friendly compatibility message as soon as the page is loaded,
			// for those browsers that are not compatible with CKEditor.
			if ( !CKEDITOR.env.isCompatible )
				showCompatibilityMsg();
		};

		// Register the onload listener.
		if ( window.addEventListener )
			window.addEventListener( 'load', onload, false );
		else if ( window.attachEvent )
			window.attachEvent( 'onload', onload );
	})();
}


/* End Standard CKeditor tips for non compatible browsers  */

/* Plone specific ckeditor launcher using jQuery */

launchCKInstances = function (ids_to_launch) {
    jQuery('.ckeditor_plone').each(function(){
        ckid = jQuery(this).attr('id');
        ids_to_launch = ids_to_launch || [];
	/* we can specify an array of ids for wich CKeditor has to be launched */
	/* if no ids is provided or if the current id is in the array of given ids, we proceed */
        if ((typeof(ids_to_launch[0]) == 'undefined') || (jQuery.inArray(ckid, ids_to_launch) >= 0)) { 
        cke_config_url = jQuery('.cke_config_url', jQuery(this).parent()).val();
        /* Here starts the local js overload of settings by a field widget */
        /* for now it only works with at rich widget : basehref width and height are the only attributes */
        /* TODO improve it for any possible widget settings with jQuery.each('',jQuery(this).parent()) ... */
        if (jQuery('.cke_iswidget', jQuery(this).parent()).length) {
            cke_width = jQuery('.cke_width', jQuery(this).parent()).val();
            cke_height = jQuery('.cke_height', jQuery(this).parent()).val();
            cke_baseHref = jQuery('.cke_baseHref', jQuery(this).parent()).val();
	    /* Destroy instance if it exists because an existing instance can not be managed twice */
	    if (typeof CKEDITOR.instances != 'undefined') {
	        var instance = CKEDITOR.instances[ckid];
                if (instance) { instance.destroy(true); }
	    };
            CKEDITOR.replace( ckid,
              {
                customConfig : cke_config_url,
                width : cke_width,
                height : cke_height,
                baseHref : cke_baseHref
              });
            }
        else  {
            CKEDITOR.replace( ckid,
              {
                customConfig : cke_config_url
              });
            }
	};
    })
}

jQuery(document).ready(launchCKInstances);

(function() {
    var showActualUrl = function showActualUrl(domElement, url) {
        if (url.indexOf('resolveuid') !== -1) {
            var current_uid = url.split('resolveuid/')[1];
            var new_url = CKEDITOR_PLONE_PORTALPATH + '/convert_uid_to_url/' + current_uid;
            var settings = {
                url: new_url,
                type: 'GET',
                success: function(data){
                    domElement.setHtml('<p>Actual URL</p><p>'+data+'</p>');
                }
            };
            $.ajax(settings);
            return;
        }
        domElement.setHtml('<p></p>');
    };

CKEDITOR.on( 'dialogDefinition', function( ev ) {
    // Take the dialog name and its definition from the event
    // data.
    var dialogName = ev.data.name;
    var dialogDefinition = ev.data.definition;

    // Check if the definition is from the dialog we're
    // interested on (the "Link" dialog).
    if ( dialogName == 'link' ) {
        // Get a reference to the "Link Info" tab.
        var infoTab = dialogDefinition.getContents( 'info' );

        infoTab.add( {
            id: 'actual',
            type : 'html',
            setup: function( data ) {
                var domElement = this.getElement();
                if ( data.url ) {
                    showActualUrl(domElement, data.url.url);
                } else {
                    domElement.setHtml('<p></p>');
                }
            },
            html : ''
        });

        var url = infoTab.get('url');
        default_onChange = url.onChange;
        url.onChange = function() {
            default_onChange();
			// Dont't call on dialog load.
			if ( this.allowOnChange ) {
                var actual = this.getDialog().getContentElement('info', 'actual');
                var domElement = actual.getElement();
                showActualUrl(domElement, this.getValue());
            }
        };
    }
});

})();
