import fs from "fs";
import path from "path";
import { Config } from "../config";
import { ConfigData } from "../config-data";
import { ConfigFactory, ConfigLoader } from "../config-loader";

/**
 * @internal
 */
function findConfigurationFiles(directory: string): string[] {
	return ["json", "cjs", "js"]
		.map((extension) => path.join(directory, `.htmlvalidate.${extension}`))
		.filter((filePath) => fs.existsSync(filePath));
}

/**
 * Loads configuration by traversing filesystem.
 *
 * Configuration is read from three sources and in the following order:
 *
 * 1. Global configuration passed to constructor.
 * 2. Configuration files found when traversing the directory structure.
 * 3. Override passed to this function.
 *
 * The following configuration filenames are searched:
 *
 * - `.htmlvalidate.json`
 * - `.htmlvalidate.js`
 * - `.htmlvalidate.cjs`
 *
 * Global configuration is used when no configuration file is found. The
 * result is always merged with override if present.
 *
 * The `root` property set to `true` affects the configuration as following:
 *
 * 1. If set in override the override is returned as-is.
 * 2. If set in the global config the override is merged into global and
 * returned. No configuration files are searched.
 * 3. Setting `root` in configuration file only stops directory traversal.
 *
 * @public
 */
export class FileSystemConfigLoader extends ConfigLoader {
	protected cache: Map<string, Config | null>;

	/**
	 * @param config - Global configuration
	 * @param configFactory - Optional configuration factory
	 */
	public constructor(config?: ConfigData, configFactory: ConfigFactory = Config) {
		super(config, configFactory);
		this.cache = new Map();
	}

	/**
	 * Get configuration for given filename.
	 *
	 * @param filename - Filename to get configuration for.
	 * @param configOverride - Configuration to merge final result with.
	 */
	public override getConfigFor(filename: string, configOverride?: ConfigData): Config {
		/* special case when the overridden configuration is marked as root, should
		 * not try to load any more configuration files */
		const override = this.loadFromObject(configOverride || {});
		if (override.isRootFound()) {
			override.init();
			return override;
		}

		/* special case when the global configuration is marked as root, should not
		 * try to load and more configuration files */
		if (this.globalConfig.isRootFound()) {
			const merged = this.globalConfig.merge(override);
			merged.init();
			return merged;
		}

		const config = this.fromFilename(filename);
		const merged = config ? config.merge(override) : this.globalConfig.merge(override);
		merged.init();
		return merged;
	}

	/**
	 * Flush configuration cache.
	 *
	 * @param filename - If given only the cache for that file is flushed.
	 */
	public override flushCache(filename?: string): void {
		if (filename) {
			this.cache.delete(filename);
		} else {
			this.cache.clear();
		}
	}

	/**
	 * Load raw configuration from directory traversal.
	 *
	 * This configuration is not merged with global configuration and may return
	 * `null` if no configuration files are found.
	 */
	public fromFilename(filename: string): Config | null {
		if (filename === "inline") {
			return null;
		}

		const cache = this.cache.get(filename);
		if (cache) {
			return cache;
		}

		let found = false;
		let current = path.resolve(path.dirname(filename));
		let config = this.empty();

		// eslint-disable-next-line no-constant-condition
		while (true) {
			/* search configuration files in current directory */
			for (const configFile of findConfigurationFiles(current)) {
				const local = this.loadFromFile(configFile);
				found = true;
				config = local.merge(config);
			}

			/* stop if a configuration with "root" is set to true */
			if (config.isRootFound()) {
				break;
			}

			/* get the parent directory */
			const child = current;
			current = path.dirname(current);

			/* stop if this is the root directory */
			if (current === child) {
				break;
			}
		}

		/* no config was found by loader, return null and let caller decide what to do */
		if (!found) {
			this.cache.set(filename, null);
			return null;
		}

		this.cache.set(filename, config);
		return config;
	}

	protected defaultConfig(): Config {
		return this.configFactory.defaultConfig();
	}
}
