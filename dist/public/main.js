const pluginConfig = HFS.getPluginConfig();

if (pluginConfig.showRunButton) {
  HFS.onEvent("afterEntryName", ({ entry, h }) => {
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

