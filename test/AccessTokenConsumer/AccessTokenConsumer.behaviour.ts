import { artifacts, ethers, waffle } from "hardhat";
import type { Artifact } from "hardhat/types";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { Signers } from "../types";
import { DummyDapp } from "../../src/types/DummyDapp";
import { signAccessToken } from "../../src/utils/signAccessToken";
import { packParameters } from "../../src/utils/packParameters";
import { splitSignature } from "@ethersproject/bytes";

const chai = require("chai");
const { solidity } = waffle;
chai.use(solidity);
const { expect } = chai;
const { BigNumber } = ethers;

const shouldBehaveLikeAccessTokenConsumer = function () {
  describe("sign and verify", async () => {
    context("when calling function", async function () {
      context("with parameters", async function () {
        describe("address", async function () {
          before("construct token", async function () {
            this.params = [this.signers.user0.address];
            this.value = {
              expiry: BigNumber.from(Math.floor(new Date().getTime() / 1000) + 10),
              functionCall: {
                functionSignature: this.mock.interface.getSighash("singleAddress"),
                target: this.mock.address,
                caller: this.signers.admin.address,
                parameters: packParameters(this.mock.interface, "singleAddress", this.params),
              },
            };
            this.signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, this.value));
          });

          it("with correct values should succeed", async function () {
            expect(
              await this.mock.singleAddress(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
              ),
            ).to.be.true;
          });

          it("with incorrect caller should revert", async function () {
            await expect(
              this.mock
                .connect(this.signers.user1)
                .singleAddress(this.signature.v, this.signature.r, this.signature.s, this.value.expiry, this.params[0]),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with expired token should revert", async function () {
            await expect(
              this.mock.singleAddress(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry.sub(50),
                this.params[0],
              ),
            ).to.be.revertedWith("AccessToken: has expired");
          });

          it("with incorrect expiry should revert", async function () {
            await expect(
              this.mock.singleAddress(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry.add(50),
                this.params[0],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect values should revert", async function () {
            await expect(
              this.mock.singleAddress(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.signers.user1.address,
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect signer should revert", async function () {
            const signature = splitSignature(await signAccessToken(this.signers.user0, this.domain, this.value));

            await expect(
              this.mock.singleAddress(signature.v, signature.r, signature.s, this.value.expiry, this.params[0]),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect function signature should revert", async function () {
            const signature = splitSignature(
              await signAccessToken(this.signers.admin, this.domain, {
                ...this.value,
                functionCall: {
                  ...this.value.functionCall,
                  functionSignature: "0xdeadbeef",
                },
              }),
            );

            await expect(
              this.mock.singleAddress(signature.v, signature.r, signature.s, this.value.expiry, this.params[0]),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect target contract should revert", async function () {
            await expect(
              this.fakeMock.singleAddress(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });
        });

        describe("uint256", async function () {
          before("construct token", async function () {
            this.params = [BigNumber.from(42)];
            this.value = {
              expiry: BigNumber.from(Math.floor(new Date().getTime() / 1000) + 10),
              functionCall: {
                functionSignature: this.mock.interface.getSighash("singleUint256"),
                target: this.mock.address,
                caller: this.signers.admin.address,
                parameters: packParameters(this.mock.interface, "singleUint256", this.params),
              },
            };
            this.signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, this.value));
          });

          it("with correct values should succeed", async function () {
            expect(
              await this.mock.singleUint256(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
              ),
            ).to.be.true;
          });

          it("with incorrect caller should revert", async function () {
            await expect(
              this.mock
                .connect(this.signers.user1)
                .singleUint256(this.signature.v, this.signature.r, this.signature.s, this.value.expiry, this.params[0]),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with expired token should revert", async function () {
            await expect(
              this.mock.singleUint256(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry.sub(50),
                this.params[0],
              ),
            ).to.be.revertedWith("AccessToken: has expired");
          });

          it("with incorrect expiry should revert", async function () {
            await expect(
              this.mock.singleUint256(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry.add(50),
                this.params[0],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect values should revert", async function () {
            await expect(
              this.mock.singleUint256(this.signature.v, this.signature.r, this.signature.s, this.value.expiry, 41),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect signer should revert", async function () {
            const signature = splitSignature(await signAccessToken(this.signers.user0, this.domain, this.value));

            await expect(
              this.mock.singleUint256(signature.v, signature.r, signature.s, this.value.expiry, this.params[0]),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect function signature should revert", async function () {
            const signature = splitSignature(
              await signAccessToken(this.signers.admin, this.domain, {
                ...this.value,
                functionCall: {
                  ...this.value.functionCall,
                  functionSignature: "0xdeadbeef",
                },
              }),
            );

            await expect(
              this.mock.singleUint256(signature.v, signature.r, signature.s, this.value.expiry, this.params[0]),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect target contract should revert", async function () {
            await expect(
              this.fakeMock.singleUint256(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });
        });

        describe("string calldata", async function () {
          before("construct token", async function () {
            this.params = ["random string"];
            this.value = {
              expiry: BigNumber.from(Math.floor(new Date().getTime() / 1000) + 10),
              functionCall: {
                functionSignature: this.mock.interface.getSighash("singleStringCalldata"),
                target: this.mock.address,
                caller: this.signers.admin.address,
                parameters: packParameters(this.mock.interface, "singleStringCalldata", this.params),
              },
            };
            this.signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, this.value));
          });

          it("with correct values should succeed", async function () {
            expect(
              await this.mock.singleStringCalldata(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
              ),
            ).to.be.true;
          });

          it("with incorrect caller should revert", async function () {
            await expect(
              this.mock
                .connect(this.signers.user1)
                .singleStringCalldata(
                  this.signature.v,
                  this.signature.r,
                  this.signature.s,
                  this.value.expiry,
                  this.params[0],
                ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with expired token should revert", async function () {
            await expect(
              this.mock.singleStringCalldata(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry.sub(50),
                this.params[0],
              ),
            ).to.be.revertedWith("AccessToken: has expired");
          });

          it("with incorrect expiry should revert", async function () {
            await expect(
              this.mock.singleStringCalldata(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry.add(50),
                this.params[0],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect values should revert", async function () {
            await expect(
              this.mock.singleStringCalldata(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                "bad string",
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect signer should revert", async function () {
            const signature = splitSignature(await signAccessToken(this.signers.user0, this.domain, this.value));

            await expect(
              this.mock.singleStringCalldata(signature.v, signature.r, signature.s, this.value.expiry, this.params[0]),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect function signature should revert", async function () {
            const signature = splitSignature(
              await signAccessToken(this.signers.admin, this.domain, {
                ...this.value,
                functionCall: {
                  ...this.value.functionCall,
                  functionSignature: "0xdeadbeef",
                },
              }),
            );

            await expect(
              this.mock.singleStringCalldata(signature.v, signature.r, signature.s, this.value.expiry, this.params[0]),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect target contract should revert", async function () {
            await expect(
              this.fakeMock.singleStringCalldata(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });
        });

        describe("string memory", async function () {
          before("construct token", async function () {
            this.params = ["random string"];
            this.value = {
              expiry: BigNumber.from(Math.floor(new Date().getTime() / 1000) + 10),
              functionCall: {
                functionSignature: this.mock.interface.getSighash("singleStringMemory"),
                target: this.mock.address,
                caller: this.signers.admin.address,
                parameters: packParameters(this.mock.interface, "singleStringMemory", this.params),
              },
            };
            this.signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, this.value));
          });

          it("with correct values should succeed", async function () {
            expect(
              await this.mock.singleStringMemory(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params,
              ),
            ).to.be.true;
          });

          it("with incorrect caller should revert", async function () {
            await expect(
              this.mock
                .connect(this.signers.user1)
                .singleStringMemory(
                  this.signature.v,
                  this.signature.r,
                  this.signature.s,
                  this.value.expiry,
                  this.params[0],
                ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with expired token should revert", async function () {
            await expect(
              this.mock.singleStringMemory(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry.sub(50),
                this.params[0],
              ),
            ).to.be.revertedWith("AccessToken: has expired");
          });

          it("with incorrect expiry should revert", async function () {
            await expect(
              this.mock.singleStringMemory(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry.add(50),
                this.params[0],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect values should revert", async function () {
            await expect(
              this.mock.singleStringMemory(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                "bad string",
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect signer should revert", async function () {
            const signature = splitSignature(await signAccessToken(this.signers.user0, this.domain, this.value));

            await expect(
              this.mock.singleStringMemory(signature.v, signature.r, signature.s, this.value.expiry, this.params[0]),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect function signature should revert", async function () {
            const signature = splitSignature(
              await signAccessToken(this.signers.admin, this.domain, {
                ...this.value,
                functionCall: {
                  ...this.value.functionCall,
                  functionSignature: "0xdeadbeef",
                },
              }),
            );

            await expect(
              this.mock.singleStringMemory(signature.v, signature.r, signature.s, this.value.expiry, this.params[0]),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect target contract should revert", async function () {
            await expect(
              this.fakeMock.singleStringMemory(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });
        });

        describe("byte", async function () {
          before("construct token", async function () {
            this.params = ["0x42"];
            this.value = {
              expiry: BigNumber.from(Math.floor(new Date().getTime() / 1000) + 10),
              functionCall: {
                functionSignature: this.mock.interface.getSighash("singleByte"),
                target: this.mock.address,
                caller: this.signers.admin.address,
                parameters: packParameters(this.mock.interface, "singleByte", this.params),
              },
            };
            this.signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, this.value));
          });

          it("with correct values should succeed", async function () {
            expect(
              await this.mock.singleByte(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
              ),
            ).to.be.true;
          });

          it("with incorrect caller should revert", async function () {
            await expect(
              this.mock
                .connect(this.signers.user1)
                .singleByte(this.signature.v, this.signature.r, this.signature.s, this.value.expiry, this.params[0]),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with expired token should revert", async function () {
            await expect(
              this.mock.singleByte(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry.sub(50),
                this.params[0],
              ),
            ).to.be.revertedWith("AccessToken: has expired");
          });

          it("with incorrect expiry should revert", async function () {
            await expect(
              this.mock.singleByte(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry.add(50),
                this.params[0],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect values should revert", async function () {
            await expect(
              this.mock.singleByte(this.signature.v, this.signature.r, this.signature.s, this.value.expiry, "0x41"),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect signer should revert", async function () {
            const signature = splitSignature(await signAccessToken(this.signers.user0, this.domain, this.value));

            await expect(
              this.mock.singleByte(signature.v, signature.r, signature.s, this.value.expiry, this.params[0]),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect function signature should revert", async function () {
            const signature = splitSignature(
              await signAccessToken(this.signers.admin, this.domain, {
                ...this.value,
                functionCall: {
                  ...this.value.functionCall,
                  functionSignature: "0xdeadbeef",
                },
              }),
            );

            await expect(
              this.mock.singleByte(signature.v, signature.r, signature.s, this.value.expiry, this.params[0]),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect target contract should revert", async function () {
            await expect(
              this.fakeMock.singleByte(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });
        });

        describe("bytes calldata", async function () {
          before("construct token", async function () {
            this.params = ["0xaaaaaaaaaaaaaaaa"];
            this.value = {
              expiry: BigNumber.from(Math.floor(new Date().getTime() / 1000) + 10),
              functionCall: {
                functionSignature: this.mock.interface.getSighash("singleBytesCalldata"),
                target: this.mock.address,
                caller: this.signers.admin.address,
                parameters: packParameters(this.mock.interface, "singleBytesCalldata", this.params),
              },
            };
            this.signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, this.value));
          });

          it("with correct values should succeed", async function () {
            expect(
              await this.mock.singleBytesCalldata(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
              ),
            ).to.be.true;
          });

          it("with incorrect caller should revert", async function () {
            await expect(
              this.mock
                .connect(this.signers.user1)
                .singleBytesCalldata(
                  this.signature.v,
                  this.signature.r,
                  this.signature.s,
                  this.value.expiry,
                  this.params[0],
                ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with expired token should revert", async function () {
            await expect(
              this.mock.singleBytesCalldata(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry.sub(50),
                this.params[0],
              ),
            ).to.be.revertedWith("AccessToken: has expired");
          });

          it("with incorrect expiry should revert", async function () {
            await expect(
              this.mock.singleBytesCalldata(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry.add(50),
                this.params[0],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect values should revert", async function () {
            await expect(
              this.mock.singleBytesCalldata(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                "0xbbbbbb",
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect signer should revert", async function () {
            const signature = splitSignature(await signAccessToken(this.signers.user0, this.domain, this.value));

            await expect(
              this.mock.singleBytesCalldata(signature.v, signature.r, signature.s, this.value.expiry, this.params[0]),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect function signature should revert", async function () {
            const signature = splitSignature(
              await signAccessToken(this.signers.admin, this.domain, {
                ...this.value,
                functionCall: {
                  ...this.value.functionCall,
                  functionSignature: "0xdeadbeef",
                },
              }),
            );

            await expect(
              this.mock.singleBytesCalldata(signature.v, signature.r, signature.s, this.value.expiry, this.params[0]),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect target contract should revert", async function () {
            await expect(
              this.fakeMock.singleBytesCalldata(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });
        });

        describe("bytes memory", async function () {
          before("construct token", async function () {
            this.params = ["0xaaaaaaaaaaaaaaaa"];
            this.value = {
              expiry: BigNumber.from(Math.floor(new Date().getTime() / 1000) + 10),
              functionCall: {
                functionSignature: this.mock.interface.getSighash("singleBytesMemory"),
                target: this.mock.address,
                caller: this.signers.admin.address,
                parameters: packParameters(this.mock.interface, "singleBytesMemory", this.params),
              },
            };
            this.signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, this.value));
          });

          it("with correct values should succeed", async function () {
            expect(
              await this.mock.singleBytesMemory(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
              ),
            ).to.be.true;
          });

          it("with incorrect caller should revert", async function () {
            await expect(
              this.mock
                .connect(this.signers.user1)
                .singleBytesMemory(
                  this.signature.v,
                  this.signature.r,
                  this.signature.s,
                  this.value.expiry,
                  this.params[0],
                ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with expired token should revert", async function () {
            await expect(
              this.mock.singleBytesMemory(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry.sub(50),
                this.params[0],
              ),
            ).to.be.revertedWith("AccessToken: has expired");
          });

          it("with incorrect expiry should revert", async function () {
            await expect(
              this.mock.singleBytesMemory(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry.add(50),
                this.params[0],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect values should revert", async function () {
            await expect(
              this.mock.singleBytesMemory(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                "0xbbbbbb",
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect signer should revert", async function () {
            const signature = splitSignature(await signAccessToken(this.signers.user0, this.domain, this.value));

            await expect(
              this.mock.singleBytesMemory(signature.v, signature.r, signature.s, this.value.expiry, this.params[0]),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect function signature should revert", async function () {
            const signature = splitSignature(
              await signAccessToken(this.signers.admin, this.domain, {
                ...this.value,
                functionCall: {
                  ...this.value.functionCall,
                  functionSignature: "0xdeadbeef",
                },
              }),
            );

            await expect(
              this.mock.singleBytesMemory(signature.v, signature.r, signature.s, this.value.expiry, this.params[0]),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect target contract should revert", async function () {
            await expect(
              this.fakeMock.singleBytesMemory(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });
        });

        describe("address, uint256", async function () {
          before("construct token", async function () {
            this.params = [this.signers.user0.address, 42];
            this.value = {
              expiry: BigNumber.from(Math.floor(new Date().getTime() / 1000) + 10),
              functionCall: {
                functionSignature: this.mock.interface.getSighash("doubleAddressUint"),
                target: this.mock.address,
                caller: this.signers.admin.address,
                parameters: packParameters(this.mock.interface, "doubleAddressUint", this.params),
              },
            };
            this.signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, this.value));
          });

          it("with correct values should succeed", async function () {
            expect(
              await this.mock.doubleAddressUint(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
              ),
            ).to.be.true;
          });

          it("with incorrect caller should revert", async function () {
            await expect(
              this.mock
                .connect(this.signers.user1)
                .doubleAddressUint(
                  this.signature.v,
                  this.signature.r,
                  this.signature.s,
                  this.value.expiry,
                  this.params[0],
                  this.params[1],
                ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with expired token should revert", async function () {
            await expect(
              this.mock.doubleAddressUint(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry.sub(50),
                this.params[0],
                this.params[1],
              ),
            ).to.be.revertedWith("AccessToken: has expired");
          });

          it("with incorrect expiry should revert", async function () {
            await expect(
              this.mock.doubleAddressUint(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry.add(50),
                this.params[0],
                this.params[1],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect values should revert", async function () {
            await expect(
              this.mock.doubleAddressUint(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
                41,
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect signer should revert", async function () {
            const signature = splitSignature(await signAccessToken(this.signers.user0, this.domain, this.value));

            await expect(
              this.mock.doubleAddressUint(
                signature.v,
                signature.r,
                signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect function signature should revert", async function () {
            const signature = splitSignature(
              await signAccessToken(this.signers.admin, this.domain, {
                ...this.value,
                functionCall: {
                  ...this.value.functionCall,
                  functionSignature: "0xdeadbeef",
                },
              }),
            );

            await expect(
              this.mock.doubleAddressUint(
                signature.v,
                signature.r,
                signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect target contract should revert", async function () {
            await expect(
              this.fakeMock.doubleAddressUint(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });
        });

        describe("uint256, string", async function () {
          before("construct token", async function () {
            this.params = [42, "some string"];
            this.value = {
              expiry: BigNumber.from(Math.floor(new Date().getTime() / 1000) + 10),
              functionCall: {
                functionSignature: this.mock.interface.getSighash("doubleUint256String"),
                target: this.mock.address,
                caller: this.signers.admin.address,
                parameters: packParameters(this.mock.interface, "doubleUint256String", this.params),
              },
            };
            this.signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, this.value));
          });

          it("with correct values should succeed", async function () {
            expect(
              await this.mock.doubleUint256String(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
              ),
            ).to.be.true;
          });

          it("with incorrect caller should revert", async function () {
            await expect(
              this.mock
                .connect(this.signers.user1)
                .doubleUint256String(
                  this.signature.v,
                  this.signature.r,
                  this.signature.s,
                  this.value.expiry,
                  this.params[0],
                  this.params[1],
                ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with expired token should revert", async function () {
            await expect(
              this.mock.doubleUint256String(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry.sub(50),
                this.params[0],
                this.params[1],
              ),
            ).to.be.revertedWith("AccessToken: has expired");
          });

          it("with incorrect expiry should revert", async function () {
            await expect(
              this.mock.doubleUint256String(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry.add(50),
                this.params[0],
                this.params[1],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect values should revert", async function () {
            await expect(
              this.mock.doubleUint256String(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
                "wrong string",
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect signer should revert", async function () {
            const signature = splitSignature(await signAccessToken(this.signers.user0, this.domain, this.value));

            await expect(
              this.mock.doubleUint256String(
                signature.v,
                signature.r,
                signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect function signature should revert", async function () {
            const signature = splitSignature(
              await signAccessToken(this.signers.admin, this.domain, {
                ...this.value,
                functionCall: {
                  ...this.value.functionCall,
                  functionSignature: "0xdeadbeef",
                },
              }),
            );

            await expect(
              this.mock.doubleUint256String(
                signature.v,
                signature.r,
                signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect target contract should revert", async function () {
            await expect(
              this.fakeMock.doubleUint256String(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });
        });

        describe("string, bytes calldata", async function () {
          before("construct token", async function () {
            this.params = ["some string", "0xaaaaaaaaaaaaaa"];
            this.value = {
              expiry: BigNumber.from(Math.floor(new Date().getTime() / 1000) + 10),
              functionCall: {
                functionSignature: this.mock.interface.getSighash("doubleStringBytesCalldata"),
                target: this.mock.address,
                caller: this.signers.admin.address,
                parameters: packParameters(this.mock.interface, "doubleStringBytesCalldata", this.params),
              },
            };
            this.signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, this.value));
          });

          it("with correct values should succeed", async function () {
            expect(
              await this.mock.doubleStringBytesCalldata(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
              ),
            ).to.be.true;
          });

          it("with incorrect caller should revert", async function () {
            await expect(
              this.mock
                .connect(this.signers.user1)
                .doubleStringBytesCalldata(
                  this.signature.v,
                  this.signature.r,
                  this.signature.s,
                  this.value.expiry,
                  this.params[0],
                  this.params[1],
                ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with expired token should revert", async function () {
            await expect(
              this.mock.doubleStringBytesCalldata(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry.sub(50),
                this.params[0],
                this.params[1],
              ),
            ).to.be.revertedWith("AccessToken: has expired");
          });

          it("with incorrect expiry should revert", async function () {
            await expect(
              this.mock.doubleStringBytesCalldata(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry.add(50),
                this.params[0],
                this.params[1],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect values should revert", async function () {
            await expect(
              this.mock.doubleStringBytesCalldata(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                "bad string",
                this.params[1],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect signer should revert", async function () {
            const signature = splitSignature(await signAccessToken(this.signers.user0, this.domain, this.value));

            await expect(
              this.mock.doubleStringBytesCalldata(
                signature.v,
                signature.r,
                signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect function signature should revert", async function () {
            const signature = splitSignature(
              await signAccessToken(this.signers.admin, this.domain, {
                ...this.value,
                functionCall: {
                  ...this.value.functionCall,
                  functionSignature: "0xdeadbeef",
                },
              }),
            );

            await expect(
              this.mock.doubleStringBytesCalldata(
                signature.v,
                signature.r,
                signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect target contract should revert", async function () {
            await expect(
              this.fakeMock.doubleStringBytesCalldata(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });
        });

        describe("string, bytes memory", async function () {
          before("construct token", async function () {
            this.params = ["some string", "0xaaaaaaaaaaaaaa"];
            this.value = {
              expiry: BigNumber.from(Math.floor(new Date().getTime() / 1000) + 10),
              functionCall: {
                functionSignature: this.mock.interface.getSighash("doubleStringBytesMemory"),
                target: this.mock.address,
                caller: this.signers.admin.address,
                parameters: packParameters(this.mock.interface, "doubleStringBytesMemory", this.params),
              },
            };
            this.signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, this.value));
          });

          it("with correct values should succeed", async function () {
            expect(
              await this.mock.doubleStringBytesMemory(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
              ),
            ).to.be.true;
          });

          it("with incorrect caller should revert", async function () {
            await expect(
              this.mock
                .connect(this.signers.user1)
                .doubleStringBytesMemory(
                  this.signature.v,
                  this.signature.r,
                  this.signature.s,
                  this.value.expiry,
                  this.params[0],
                  this.params[1],
                ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with expired token should revert", async function () {
            await expect(
              this.mock.doubleStringBytesMemory(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry.sub(50),
                this.params[0],
                this.params[1],
              ),
            ).to.be.revertedWith("AccessToken: has expired");
          });

          it("with incorrect expiry should revert", async function () {
            await expect(
              this.mock.doubleStringBytesMemory(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry.add(50),
                this.params[0],
                this.params[1],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect values should revert", async function () {
            await expect(
              this.mock.doubleStringBytesMemory(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                "bad string",
                this.params[1],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect signer should revert", async function () {
            const signature = splitSignature(await signAccessToken(this.signers.user0, this.domain, this.value));

            await expect(
              this.mock.doubleStringBytesMemory(
                signature.v,
                signature.r,
                signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect function signature should revert", async function () {
            const signature = splitSignature(
              await signAccessToken(this.signers.admin, this.domain, {
                ...this.value,
                functionCall: {
                  ...this.value.functionCall,
                  functionSignature: "0xdeadbeef",
                },
              }),
            );

            await expect(
              this.mock.doubleStringBytesMemory(
                signature.v,
                signature.r,
                signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect target contract should revert", async function () {
            await expect(
              this.fakeMock.doubleStringBytesMemory(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });
        });

        describe("string, bytes calldata, address", async function () {
          before("construct token", async function () {
            this.params = ["some string", "0xaaaaaaaaaaaaaa", this.signers.user0.address];
            this.value = {
              expiry: BigNumber.from(Math.floor(new Date().getTime() / 1000) + 10),
              functionCall: {
                functionSignature: this.mock.interface.getSighash("multipleStringBytesAddress"),
                target: this.mock.address,
                caller: this.signers.admin.address,
                parameters: packParameters(this.mock.interface, "multipleStringBytesAddress", this.params),
              },
            };
            this.signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, this.value));
          });

          it("with correct values should succeed", async function () {
            expect(
              await this.mock.multipleStringBytesAddress(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
                this.params[2],
              ),
            ).to.be.true;
          });

          it("with incorrect caller should revert", async function () {
            await expect(
              this.mock
                .connect(this.signers.user1)
                .multipleStringBytesAddress(
                  this.signature.v,
                  this.signature.r,
                  this.signature.s,
                  this.value.expiry,
                  this.params[0],
                  this.params[1],
                  this.params[2],
                ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with expired token should revert", async function () {
            await expect(
              this.mock.multipleStringBytesAddress(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry.sub(50),
                this.params[0],
                this.params[1],
                this.params[2],
              ),
            ).to.be.revertedWith("AccessToken: has expired");
          });

          it("with incorrect expiry should revert", async function () {
            await expect(
              this.mock.multipleStringBytesAddress(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry.add(50),
                this.params[0],
                this.params[1],
                this.params[2],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect values should revert", async function () {
            await expect(
              this.mock.multipleStringBytesAddress(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                "bad string",
                this.params[1],
                this.params[2],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect signer should revert", async function () {
            const signature = splitSignature(await signAccessToken(this.signers.user0, this.domain, this.value));

            await expect(
              this.mock.multipleStringBytesAddress(
                signature.v,
                signature.r,
                signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
                this.params[2],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect function signature should revert", async function () {
            const signature = splitSignature(
              await signAccessToken(this.signers.admin, this.domain, {
                ...this.value,
                functionCall: {
                  ...this.value.functionCall,
                  functionSignature: "0xdeadbeef",
                },
              }),
            );

            await expect(
              this.mock.multipleStringBytesAddress(
                signature.v,
                signature.r,
                signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
                this.params[2],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect target contract should revert", async function () {
            await expect(
              this.fakeMock.multipleStringBytesAddress(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
                this.params[2],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });
        });

        describe("string, bytes calldata, address, uint256", async function () {
          before("construct token", async function () {
            this.params = ["some string", "0xaaaaaaaaaaaaaa", this.signers.user0.address, 42];
            this.value = {
              expiry: BigNumber.from(Math.floor(new Date().getTime() / 1000) + 10),
              functionCall: {
                functionSignature: this.mock.interface.getSighash("multipleStringBytesAddressUint256"),
                target: this.mock.address,
                caller: this.signers.admin.address,
                parameters: packParameters(this.mock.interface, "multipleStringBytesAddressUint256", this.params),
              },
            };
            this.signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, this.value));
          });

          it("with correct values should succeed", async function () {
            expect(
              await this.mock.multipleStringBytesAddressUint256(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
                this.params[2],
                this.params[3],
              ),
            ).to.be.true;
          });

          it("with incorrect caller should revert", async function () {
            await expect(
              this.mock
                .connect(this.signers.user1)
                .multipleStringBytesAddressUint256(
                  this.signature.v,
                  this.signature.r,
                  this.signature.s,
                  this.value.expiry,
                  this.params[0],
                  this.params[1],
                  this.params[2],
                  this.params[3],
                ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with expired token should revert", async function () {
            await expect(
              this.mock.multipleStringBytesAddressUint256(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry.sub(50),
                this.params[0],
                this.params[1],
                this.params[2],
                this.params[3],
              ),
            ).to.be.revertedWith("AccessToken: has expired");
          });

          it("with incorrect expiry should revert", async function () {
            await expect(
              this.mock.multipleStringBytesAddressUint256(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry.add(50),
                this.params[0],
                this.params[1],
                this.params[2],
                this.params[3],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect values should revert", async function () {
            await expect(
              this.mock.multipleStringBytesAddressUint256(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                "bad string",
                this.params[1],
                this.params[2],
                this.params[3],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect signer should revert", async function () {
            const signature = splitSignature(await signAccessToken(this.signers.user0, this.domain, this.value));

            await expect(
              this.mock.multipleStringBytesAddressUint256(
                signature.v,
                signature.r,
                signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
                this.params[2],
                this.params[3],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect function signature should revert", async function () {
            const signature = splitSignature(
              await signAccessToken(this.signers.admin, this.domain, {
                ...this.value,
                functionCall: {
                  ...this.value.functionCall,
                  functionSignature: "0xdeadbeef",
                },
              }),
            );

            await expect(
              this.mock.multipleStringBytesAddressUint256(
                signature.v,
                signature.r,
                signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
                this.params[2],
                this.params[3],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect target contract should revert", async function () {
            await expect(
              this.fakeMock.multipleStringBytesAddressUint256(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
                this.params[2],
                this.params[3],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });
        });

        describe("string, bytes calldata, address, uint256, bytes calldata", async function () {
          before("construct token", async function () {
            this.params = ["some string", "0xaaaaaaaaaaaaaa", this.signers.user0.address, 42, "0xbbbbbbbbbbbb"];
            this.value = {
              expiry: BigNumber.from(Math.floor(new Date().getTime() / 1000) + 10),
              functionCall: {
                functionSignature: this.mock.interface.getSighash("multipleStringBytesAddressUint256Bytes"),
                target: this.mock.address,
                caller: this.signers.admin.address,
                parameters: packParameters(this.mock.interface, "multipleStringBytesAddressUint256Bytes", this.params),
              },
            };
            this.signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, this.value));
          });

          it("with correct values should succeed", async function () {
            expect(
              await this.mock.multipleStringBytesAddressUint256Bytes(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
                this.params[2],
                this.params[3],
                this.params[4],
              ),
            ).to.be.true;
          });

          it("with incorrect caller should revert", async function () {
            await expect(
              this.mock
                .connect(this.signers.user1)
                .multipleStringBytesAddressUint256Bytes(
                  this.signature.v,
                  this.signature.r,
                  this.signature.s,
                  this.value.expiry,
                  this.params[0],
                  this.params[1],
                  this.params[2],
                  this.params[3],
                  this.params[4],
                ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with expired token should revert", async function () {
            await expect(
              this.mock.multipleStringBytesAddressUint256Bytes(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry.sub(50),
                this.params[0],
                this.params[1],
                this.params[2],
                this.params[3],
                this.params[4],
              ),
            ).to.be.revertedWith("AccessToken: has expired");
          });

          it("with incorrect expiry should revert", async function () {
            await expect(
              this.mock.multipleStringBytesAddressUint256Bytes(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry.add(50),
                this.params[0],
                this.params[1],
                this.params[2],
                this.params[3],
                this.params[4],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect values should revert", async function () {
            await expect(
              this.mock.multipleStringBytesAddressUint256Bytes(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                "bad string",
                this.params[1],
                this.params[2],
                this.params[3],
                this.params[4],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect signer should revert", async function () {
            const signature = splitSignature(await signAccessToken(this.signers.user0, this.domain, this.value));

            await expect(
              this.mock.multipleStringBytesAddressUint256Bytes(
                signature.v,
                signature.r,
                signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
                this.params[2],
                this.params[3],
                this.params[4],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect function signature should revert", async function () {
            const signature = splitSignature(
              await signAccessToken(this.signers.admin, this.domain, {
                ...this.value,
                functionCall: {
                  ...this.value.functionCall,
                  functionSignature: "0xdeadbeef",
                },
              }),
            );

            await expect(
              this.mock.multipleStringBytesAddressUint256Bytes(
                signature.v,
                signature.r,
                signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
                this.params[2],
                this.params[3],
                this.params[4],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });

          it("with incorrect target contract should revert", async function () {
            await expect(
              this.fakeMock.multipleStringBytesAddressUint256Bytes(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
                this.params[2],
                this.params[3],
                this.params[4],
              ),
            ).to.be.revertedWith("AccessToken: verification failure");
          });
        });
      });

      context("without parameters", async function () {
        before("construct token", async function () {
          this.params = BigNumber.from(42);
          this.value = {
            expiry: BigNumber.from(Math.floor(new Date().getTime() / 1000) + 10),
            functionCall: {
              functionSignature: this.mock.interface.getSighash("noParams"),
              target: this.mock.address,
              caller: this.signers.admin.address,
              parameters: [],
            },
          };
          this.signature = splitSignature(await signAccessToken(this.signers.admin, this.domain, this.value));
        });

        it("with correct values should succeed", async function () {
          expect(
            await this.mock.noParams(this.signature.v, this.signature.r, this.signature.s, this.value.expiry),
          ).to.be.true;
        });

        it("with incorrect caller should revert", async function () {
          await expect(
            this.mock
              .connect(this.signers.user1)
              .noParams(this.signature.v, this.signature.r, this.signature.s, this.value.expiry),
          ).to.be.revertedWith("AccessToken: verification failure");
        });

        it("with expired token should revert", async function () {
          await expect(
            this.mock.noParams(this.signature.v, this.signature.r, this.signature.s, this.value.expiry.sub(50)),
          ).to.be.revertedWith("AccessToken: has expired");
        });

        it("with incorrect expiry should revert", async function () {
          await expect(
            this.mock.noParams(this.signature.v, this.signature.r, this.signature.s, this.value.expiry.add(50)),
          ).to.be.revertedWith("AccessToken: verification failure");
        });

        it("with incorrect signer should revert", async function () {
          const signature = splitSignature(await signAccessToken(this.signers.user0, this.domain, this.value));

          await expect(this.mock.noParams(signature.v, signature.r, signature.s, this.value.expiry)).to.be.revertedWith(
            "AccessToken: verification failure",
          );
        });

        it("with incorrect target contract should revert", async function () {
          await expect(
            this.fakeMock.noParams(this.signature.v, this.signature.r, this.signature.s, this.value.expiry),
          ).to.be.revertedWith("AccessToken: verification failure");
        });
      });
    });
  });
};

export { shouldBehaveLikeAccessTokenConsumer };
