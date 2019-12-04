# Xar Hub 2 Upgrade

## Upgrade Procedure for non validators

Non validators can simply stop their node, upgrade their xard to the branch hub_2_invariants, rebuild the client, and then wait for the updated genesis_hub_2.json to be released after block height **750,000**

```
xard stop
git checkout remotes/origin/hub_2_invariants
make install
xard unsafe-reset-all
```

After the new genesis file has been made available after height **750,000** you can download the new genesis_hub_2 and restart

```
curl https://raw.githubusercontent.com/xar-network/genesis/master/genesis_hub_2.json > $HOME/.xard/config/genesis.json
xard start
```

The current target version is;

```
$ xard version --long
name: xar
server_name: xar
client_name: xarcli
version: 2.0.7-141-gfa04925
commit: fa049252a7ac56af99bad66cfce49de644e40c1e
build_tags: netgo,ledger
go: go version go1.13.3 linux/amd64
```


## Upgrade Procedure for validators (simple)

**NOTE**: This assumes you have read [Upgrade Procedure for non validators](#upgrade-procedure-for-validators-simple)

The upgrade height will be set to: **750,000**

Validators need to stop their node at height **750,000** this can either be achieved manually, or by using the `--halt-height` flag.

Stop xard, then restart with;

```
xard start --halt-height=750000
```

After the node has stopped you can download the updated height **750,000** genesis_hub_2.json via the genesis repo (will be made available after height **750,000**)

During this time, rebuild your client and prepare for the restart

```
xard stop
git checkout remotes/origin/hub_2_invariants
make install
xard unsafe-reset-all
```

Confirm the target version;

```
$ xard version --long
name: xar
server_name: xar
client_name: xarcli
version: 2.0.7-141-gfa04925
commit: fa049252a7ac56af99bad66cfce49de644e40c1e
build_tags: netgo,ledger
go: go version go1.13.3 linux/amd64
```

When the genesis_hub_2.json has been made available (this will be shared in the validator telegram channel), simply download the genesis_hub_2.json and restart

```
curl https://raw.githubusercontent.com/xar-network/genesis/master/genesis_hub_2.json > $HOME/.xard/config/genesis.json
xard start
```

The genesis start time will be set to 60 minutes after height **750,000**

## Upgrade Procedure for validators (manual)

**NOTE**: This assumes you have read [Upgrade Procedure for non validators](#upgrade-procedure-for-validators-simple)

The upgrade height will be set to: **750,000**

Validators need to stop their node at height **750,000** this can either be achieved manually, or by using the `--halt-height` flag.

Stop xard, then restart with;

```
xard start --halt-height=750000
```

After height **750,000** has been reached, you need to generate the new genesis_hub_2.json, this is achieved by using the exporter branch

```
xard stop
git checkout remotes/origin/exporter
make install
xard export --for-zero-height --height=750000 > genesis_hub_1_export.json
```

genesis_hub_1_export.json needs to be converted to genesis_hub_2_export.json, you can achieve this by using the migrate script in this repo

```
git clone https://github.com/xar-network/genesis.git
npm install
node migrate.js
```

Running migrate.js will create genesis_hub_2_export.json, copy this over to your data directory

```
mv genesis_hub_2_export.json $HOME/.xard/config/genesis.json
```

With genesis_hub_2.json in place, we need to rebuild to the hub_2_invariants branch and restart

```
git checkout remotes/origin/hub_2_invariants
make install
xard unsafe-reset-all
```

Confirm the target version;

```
$ xard version --long
name: xar
server_name: xar
client_name: xarcli
version: 2.0.7-141-gfa04925
commit: fa049252a7ac56af99bad66cfce49de644e40c1e
build_tags: netgo,ledger
go: go version go1.13.3 linux/amd64
```

Simply start up your node

```
xard start
```

The genesis start time will be set to **60 minutes** after height **750,000**
