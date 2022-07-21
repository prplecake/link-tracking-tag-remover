let tags = [];
const _notification = 'link-tracking-tag-remover-notification';
const twitterURLs = [
	'*://twitter.com/*',
	'*://*.twitter.com/*'
];

const urlPattern = 'https?://w*.?twitter.com/w*';
const urlRegExp = new RegExp(urlPattern);

browser.webRequest.onBeforeRequest.addListener(
	interceptRequest, {
		urls: twitterURLs,
	},
	['blocking']
);
browser.webNavigation.onCompleted.addListener(
	(event) => {
		if (urlRegExp.test(event.url)) {
			console.log('true');
			console.log('tags: ', tags);
			if (tags && tags.length) {
				browser.storage.local.get('disableNotifications').then((item) => {
					if (!item.disableNotifications) {
						browser.notifications
							.create(_notification, {
								message: `The following tags were found and have been removed: ${tags}`,
								title: 'Link Tracking Tag Remover',
								type: 'basic',
							})
							.finally(() => (tags = []));
					} else {
						tags = [];
					}
				});
			}
		}
	}, {
		url: [{
			urlMatches: urlPattern,
		}, ],
	}
);

function interceptRequest(request) {
	if (request && request.url) {
		const sanitizedResult = sanitizeURL(request.url);
		if (sanitizedResult.match) {
			return {
				redirectUrl: sanitizedResult.url
			};
		}
	}
}

function sanitizeURL(urlString) {
	let rawURL = decodeURIComponent(urlString);
	// URL does not contain a valid query parameter, patch it
	if (!rawURL.includes('?') && rawURL.includes('&')) {
		rawURL = replaceAt(rawURL, rawURL.lastIndexOf('/'), '?');
	}
	const url = new URL(rawURL);
	let match = false;
	const searchParams = url.searchParams;
	if (searchParams.has('t')) {
		tags.push(searchParams.get('t'));
		match = true;
		searchParams.delete('t');
	}
	if (searchParams.has('s')) {
		tags.push(searchParams.get('s'));
		match = true;
		searchParams.delete('s');
	}
	return {
		match,
		url: url.toString()
	};
}

function replaceAt(original, index, replacement) {
	return original.substr(0, index) + replacement + original.substr(index + replacement.length);
}
