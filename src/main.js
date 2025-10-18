const pluginConfig = HFS.getPluginConfig();

// Add run buttons to executable files
if (pluginConfig.showRunButton) {
  HFS.onEvent("afterEntryName", ({ entry, h }) => {
    // Check if user has permission to see run buttons
    const allowedUsers = pluginConfig.allowedUsers || [];
    const currentUser = HFS.state.username;

    // If allowedUsers is empty, show to all users
    // Otherwise, check if current user is in the allowed list
    const canSeeButton =
      allowedUsers.length === 0 ||
      allowedUsers.some((user) => HFS.userBelongsTo(user));

    if (!canSeeButton) {
      return null;
    }

    const extensions = pluginConfig.fileExtensions || "exe|msi|bat|ps1|vbs";
    const extensionPattern = new RegExp(extensions, "i");

    return (
      extensionPattern.test(entry.ext) &&
      HFS.h("button", {
        className: "run-button fas fa-play",
        title: "Run this file on server",
        onClick: () => runFileOnServer(entry),
      })
    );
  });
}

async function runFileOnServer(entry) {
  try {
    const response = await HFS.customRestCall("runFile", { file: entry.name });

    if (response.success) {
      HFS.toast(`"${entry.name}" executed successfully`, "success");
    } else {
      HFS.toast(`Error: ${response.error}`, "error");
    }
  } catch (error) {
    HFS.toast(`Failed to execute "${entry.name}": ${error.message}`, "error");
  }
}

