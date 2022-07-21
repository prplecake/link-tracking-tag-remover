function saveOptions(e) {
	e.preventDefault();
	browser.storage.local.set({
		disableNotifications: !document.querySelector('#disable-notifications').checked,
	});
}

function restoreOptions() {
	function setCurrentChoice(result) {
		document.querySelector('#disable-notifications').checked = !result.disableNotifications;
	}

	browser.storage.local.get('disableNotifications', setCurrentChoice);
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);
