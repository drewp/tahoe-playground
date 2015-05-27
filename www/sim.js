var sim = {};

(function() {
var alphabet = 'abcdefghijklmnopqrstuvwxyz234567';
var N_shares = 10;
var K_required = 3;
var encryptionRelativeSize = 3.0;

sim.onEncrypt = function() {
    var cleartext = $('.cleartext').val();
    var fakeHash = simpleHash(cleartext);

    $('#url').text('http://localhost:8123/uri/URI%3ACHK%3A' + 
		   randomHex(fakeHash + 1234, 128) + ':' + 
		   randomHex(fakeHash + 5678, 256) + ':' + 
		   K_required + ':' + N_shares + ':' + cleartext.length);
    
    $('#encrypted').val(randomHex(fakeHash + 9876, 
				  cleartext.length * 8 * encryptionRelativeSize, 
				  100));
    sim.updateActiveSteps();
}

sim.onStore = function() {
    var cleartext = $('#cleartext').val();
    var fakeHash = simpleHash(cleartext);
    $('#shares').empty();
    for (var row=0; row < Math.ceil(N_shares / 4); row++) {
	var rowElem = $('<tr>');
	for (var col=0; col < 4 && (row * 4 + col < N_shares); col++) {
	    var shareNum = row*4+col + 1;
	    var td = $('<td>');

	    td.append($('<div>').text('#' + shareNum));
	    var data = randomHex(fakeHash + shareNum, 
		                 cleartext.length * 8 / K_required, 25);
	    td.append($('<textarea>').attr({class: 'encrypted share', 
					    id: 'share'+shareNum,
					    correctValue: data,
					    cols: '26', rows: '4'}).val(data));

	    rowElem.append(td);
	}
	$('#shares').append(rowElem);
    }
    sim.updateActiveSteps();
}

sim.onRecover = function() {
    var usableShares = new Array();
    for (var i=1; i <= N_shares; i++) {
	var cell = $('#share' + i);

	cell.removeClass('share-used share-errored');

	if (usableShares.length >= K_required) {
	    continue;
	}

	if (cell.val() == cell.attr('correctValue')) {
	    usableShares.push(i);
	    cell.addClass('share-used');
	} else {
	    cell.addClass('share-errored');
	}
    }
    if (usableShares.length == K_required) {
	$('#recovered').val($('#cleartext').val()); // sssh!
	$('#recover-report').text('Recovery used these shares: ' + usableShares);
    } else {
	$('#recovered').val('');
	$('#recover-report').text('Recovery failed');
    }
}

sim.updateActiveSteps = function() {
    $('#active-encrypt, #active-store, #active-recover').addClass('disabled');

    if ($('#cleartext').val() != '') {
	$('#active-encrypt').removeClass('disabled');

	if ($('#encrypted').val() != '') {
	    $('#active-store').removeClass('disabled');

	    if ($('#shares').find('td').length > 3) {
		$('#active-recover').removeClass('disabled');
	    }
	}
    }
}

var _seed = 0;
function awfulRandSeed(seed) {
    _seed = seed;
}
function awfulRand() {
    _seed = (_seed * 93485039485) % 1029480192;
    return (_seed % 10000) / 10000;
}

function randomHex(seed, bits, width) {
    var result = '';
    awfulRandSeed(seed);
    var chars = charsNeeded(bits, alphabet.length);
    for (var i=0; i < chars; i++) {
	result += alphabet[Math.floor(awfulRand() * alphabet.length)];
	if (!(width == undefined) && (i + 1) % width == 0) {
	    result += '\n';
	}
    }
    return result;
}

function simpleHash(s) {
    var result = 0;
    for (var i=0; i < s.length; i++) {
	result += s.charCodeAt(i);
    }
    return (result * 95739387523) % 100000000;
}

function charsNeeded(bits, alphabetSize) {
    var bitsPerChar = Math.log(alphabetSize) / Math.log(2);
    return Math.ceil(bits / bitsPerChar)
}
})();
