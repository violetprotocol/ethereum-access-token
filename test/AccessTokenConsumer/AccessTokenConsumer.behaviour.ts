import { ethers, waffle } from "hardhat";
import chai from "chai";
import { hexValue, splitSignature } from "@ethersproject/bytes";
import { signAccessToken } from "../../src/utils/signAccessToken";
import { packParameters } from "../../src/utils/packParameters";
import { generateEAT } from "../helpers/utils";

const { solidity } = waffle;
chai.use(solidity);
const { expect } = chai;
const { BigNumber } = ethers;

const shouldBehaveLikeAccessTokenConsumer = function () {
  describe("sign and verify", async () => {
    context("when calling function", async function () {
      context("with parameters", async function () {
        describe("address", async function () {
          beforeEach("construct token", async function () {
            this.params = [this.signers.user0.address];
            const { value, signature } = await generateEAT(
              this.signers.admin,
              this.domain,
              this.mock.interface,
              "singleAddress",
              this.mock.address,
              this.signers.admin.address,
              this.params,
              BigNumber.from(Math.floor(new Date().getTime())),
            );

            this.value = value;
            this.signature = signature;
          });

          it("with correct values should succeed", async function () {
            expect(
              await this.mock.callStatic.singleAddress(
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
            const { value, signature } = await generateEAT(
              this.signers.admin,
              this.domain,
              this.mock.interface,
              "singleAddress",
              this.mock.address,
              this.signers.admin.address,
              this.params,
              BigNumber.from(Math.floor(new Date().getTime())).div(1000).sub(1000),
            );

            await expect(
              this.mock.singleAddress(signature.v, signature.r, signature.s, value.expiry, this.params[0]),
            ).to.be.revertedWith("AccessToken: has expired");
          });

          it("with already used token should revert", async function () {
            await expect(
              this.mock.singleAddress(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
              ),
            ).to.not.be.reverted;

            await expect(
              this.mock.singleAddress(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
              ),
            ).to.be.revertedWith("AccessToken: already used");
          });

          it("with incorrect expiry should revert", async function () {
            await expect(
              this.mock.singleAddress(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry.add(5000),
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
          beforeEach("construct token", async function () {
            this.params = [BigNumber.from(42)];
            const { value, signature } = await generateEAT(
              this.signers.admin,
              this.domain,
              this.mock.interface,
              "singleUint256",
              this.mock.address,
              this.signers.admin.address,
              this.params,
              BigNumber.from(Math.floor(new Date().getTime())),
            );

            this.value = value;
            this.signature = signature;
          });

          it("with correct values should succeed", async function () {
            expect(
              await this.mock.callStatic.singleUint256(
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
            const { value, signature } = await generateEAT(
              this.signers.admin,
              this.domain,
              this.mock.interface,
              "singleUint256",
              this.mock.address,
              this.signers.admin.address,
              this.params,
              BigNumber.from(Math.floor(new Date().getTime())).div(1000).sub(1000),
            );

            await expect(
              this.mock.singleUint256(signature.v, signature.r, signature.s, value.expiry, this.params[0]),
            ).to.be.revertedWith("AccessToken: has expired");
          });

          it("with already used token should revert", async function () {
            await expect(
              this.mock.singleUint256(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
              ),
            ).to.not.be.reverted;

            await expect(
              this.mock.singleUint256(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
              ),
            ).to.be.revertedWith("AccessToken: already used");
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
          beforeEach("construct token", async function () {
            this.params = ["random string"];

            const { value, signature } = await generateEAT(
              this.signers.admin,
              this.domain,
              this.mock.interface,
              "singleStringCalldata",
              this.mock.address,
              this.signers.admin.address,
              this.params,
              BigNumber.from(Math.floor(new Date().getTime())),
            );

            this.value = value;
            this.signature = signature;
          });

          it("with correct values should succeed", async function () {
            expect(
              await this.mock.callStatic.singleStringCalldata(
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
            const { value, signature } = await generateEAT(
              this.signers.admin,
              this.domain,
              this.mock.interface,
              "singleStringCalldata",
              this.mock.address,
              this.signers.admin.address,
              this.params,
              BigNumber.from(Math.floor(new Date().getTime())).div(1000).sub(1000),
            );

            await expect(
              this.mock.singleStringCalldata(signature.v, signature.r, signature.s, value.expiry, this.params[0]),
            ).to.be.revertedWith("AccessToken: has expired");
          });

          it("with already used token should revert", async function () {
            await expect(
              this.mock.singleStringCalldata(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
              ),
            ).to.not.be.reverted;

            await expect(
              this.mock.singleStringCalldata(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
              ),
            ).to.be.revertedWith("AccessToken: already used");
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
          beforeEach("construct token", async function () {
            this.params = ["random string"];

            const { value, signature } = await generateEAT(
              this.signers.admin,
              this.domain,
              this.mock.interface,
              "singleStringMemory",
              this.mock.address,
              this.signers.admin.address,
              this.params,
              BigNumber.from(Math.floor(new Date().getTime())),
            );

            this.value = value;
            this.signature = signature;
          });

          it("with correct values should succeed", async function () {
            expect(
              await this.mock.callStatic.singleStringMemory(
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
            const { value, signature } = await generateEAT(
              this.signers.admin,
              this.domain,
              this.mock.interface,
              "singleStringMemory",
              this.mock.address,
              this.signers.admin.address,
              this.params,
              BigNumber.from(Math.floor(new Date().getTime())).div(1000).sub(1000),
            );

            await expect(
              this.mock.singleStringMemory(signature.v, signature.r, signature.s, value.expiry.sub(50), this.params[0]),
            ).to.be.revertedWith("AccessToken: has expired");
          });

          it("with already used token should revert", async function () {
            await expect(
              this.mock.singleStringMemory(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
              ),
            ).to.not.be.reverted;

            await expect(
              this.mock.singleStringMemory(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
              ),
            ).to.be.revertedWith("AccessToken: already used");
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
          beforeEach("construct token", async function () {
            this.params = ["0x42"];

            const { value, signature } = await generateEAT(
              this.signers.admin,
              this.domain,
              this.mock.interface,
              "singleByte",
              this.mock.address,
              this.signers.admin.address,
              this.params,
              BigNumber.from(Math.floor(new Date().getTime())),
            );

            this.value = value;
            this.signature = signature;
          });

          it("with correct values should succeed", async function () {
            expect(
              await this.mock.callStatic.singleByte(
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
            const { value, signature } = await generateEAT(
              this.signers.admin,
              this.domain,
              this.mock.interface,
              "singleByte",
              this.mock.address,
              this.signers.admin.address,
              this.params,
              BigNumber.from(Math.floor(new Date().getTime())).div(1000).sub(1000),
            );

            await expect(
              this.mock.singleByte(signature.v, signature.r, signature.s, value.expiry, this.params[0]),
            ).to.be.revertedWith("AccessToken: has expired");
          });

          it("with already used token should revert", async function () {
            await expect(
              this.mock.singleByte(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
              ),
            ).to.not.be.reverted;

            await expect(
              this.mock.singleByte(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
              ),
            ).to.be.revertedWith("AccessToken: already used");
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
          beforeEach("construct token", async function () {
            this.params = ["0xaaaaaaaaaaaaaaaa"];

            const { value, signature } = await generateEAT(
              this.signers.admin,
              this.domain,
              this.mock.interface,
              "singleBytesCalldata",
              this.mock.address,
              this.signers.admin.address,
              this.params,
              BigNumber.from(Math.floor(new Date().getTime())),
            );

            this.value = value;
            this.signature = signature;
          });

          it("with correct values should succeed", async function () {
            expect(
              await this.mock.callStatic.singleBytesCalldata(
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
            const { value, signature } = await generateEAT(
              this.signers.admin,
              this.domain,
              this.mock.interface,
              "singleBytesCalldata",
              this.mock.address,
              this.signers.admin.address,
              this.params,
              BigNumber.from(Math.floor(new Date().getTime())).div(1000).sub(1000),
            );

            await expect(
              this.mock.singleBytesCalldata(signature.v, signature.r, signature.s, value.expiry, this.params[0]),
            ).to.be.revertedWith("AccessToken: has expired");
          });

          it("with already used token should revert", async function () {
            await expect(
              this.mock.singleBytesCalldata(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
              ),
            ).to.not.be.reverted;

            await expect(
              this.mock.singleBytesCalldata(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
              ),
            ).to.be.revertedWith("AccessToken: already used");
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
          beforeEach("construct token", async function () {
            this.params = ["0xaaaaaaaaaaaaaaaa"];

            const { value, signature } = await generateEAT(
              this.signers.admin,
              this.domain,
              this.mock.interface,
              "singleBytesMemory",
              this.mock.address,
              this.signers.admin.address,
              this.params,
              BigNumber.from(Math.floor(new Date().getTime())),
            );

            this.value = value;
            this.signature = signature;
          });

          it("with correct values should succeed", async function () {
            expect(
              await this.mock.callStatic.singleBytesMemory(
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
            const { value, signature } = await generateEAT(
              this.signers.admin,
              this.domain,
              this.mock.interface,
              "singleBytesMemory",
              this.mock.address,
              this.signers.admin.address,
              this.params,
              BigNumber.from(Math.floor(new Date().getTime())).div(1000).sub(1000),
            );

            await expect(
              this.mock.singleBytesMemory(signature.v, signature.r, signature.s, value.expiry, this.params[0]),
            ).to.be.revertedWith("AccessToken: has expired");
          });

          it("with already used token should revert", async function () {
            await expect(
              this.mock.singleBytesMemory(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
              ),
            ).to.not.be.reverted;

            await expect(
              this.mock.singleBytesMemory(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
              ),
            ).to.be.revertedWith("AccessToken: already used");
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
          beforeEach("construct token", async function () {
            this.params = [this.signers.user0.address, 42];

            const { value, signature } = await generateEAT(
              this.signers.admin,
              this.domain,
              this.mock.interface,
              "doubleAddressUint",
              this.mock.address,
              this.signers.admin.address,
              this.params,
              BigNumber.from(Math.floor(new Date().getTime())),
            );

            this.value = value;
            this.signature = signature;
          });

          it("with correct values should succeed", async function () {
            expect(
              await this.mock.callStatic.doubleAddressUint(
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
            const { value, signature } = await generateEAT(
              this.signers.admin,
              this.domain,
              this.mock.interface,
              "doubleAddressUint",
              this.mock.address,
              this.signers.admin.address,
              this.params,
              BigNumber.from(Math.floor(new Date().getTime())).div(1000).sub(1000),
            );

            await expect(
              this.mock.doubleAddressUint(
                signature.v,
                signature.r,
                signature.s,
                value.expiry,
                this.params[0],
                this.params[1],
              ),
            ).to.be.revertedWith("AccessToken: has expired");
          });

          it("with already used token should revert", async function () {
            await expect(
              this.mock.doubleAddressUint(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
              ),
            ).to.not.be.reverted;

            await expect(
              this.mock.doubleAddressUint(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
              ),
            ).to.be.revertedWith("AccessToken: already used");
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
          beforeEach("construct token", async function () {
            this.params = [42, "some string"];

            const { value, signature } = await generateEAT(
              this.signers.admin,
              this.domain,
              this.mock.interface,
              "doubleUint256String",
              this.mock.address,
              this.signers.admin.address,
              this.params,
              BigNumber.from(Math.floor(new Date().getTime())),
            );

            this.value = value;
            this.signature = signature;
          });

          it("with correct values should succeed", async function () {
            expect(
              await this.mock.callStatic.doubleUint256String(
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
            const { value, signature } = await generateEAT(
              this.signers.admin,
              this.domain,
              this.mock.interface,
              "doubleUint256String",
              this.mock.address,
              this.signers.admin.address,
              this.params,
              BigNumber.from(Math.floor(new Date().getTime())).div(1000).sub(1000),
            );

            await expect(
              this.mock.doubleUint256String(
                signature.v,
                signature.r,
                signature.s,
                value.expiry,
                this.params[0],
                this.params[1],
              ),
            ).to.be.revertedWith("AccessToken: has expired");
          });

          it("with already used token should revert", async function () {
            await expect(
              this.mock.doubleUint256String(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
              ),
            ).to.not.be.reverted;

            await expect(
              this.mock.doubleUint256String(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
              ),
            ).to.be.revertedWith("AccessToken: already used");
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
          beforeEach("construct token", async function () {
            this.params = ["some string", "0xaaaaaaaaaaaaaa"];

            const { value, signature } = await generateEAT(
              this.signers.admin,
              this.domain,
              this.mock.interface,
              "doubleStringBytesCalldata",
              this.mock.address,
              this.signers.admin.address,
              this.params,
              BigNumber.from(Math.floor(new Date().getTime())),
            );

            this.value = value;
            this.signature = signature;
          });

          it("with correct values should succeed", async function () {
            expect(
              await this.mock.callStatic.doubleStringBytesCalldata(
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
            const { value, signature } = await generateEAT(
              this.signers.admin,
              this.domain,
              this.mock.interface,
              "doubleStringBytesCalldata",
              this.mock.address,
              this.signers.admin.address,
              this.params,
              BigNumber.from(Math.floor(new Date().getTime())).div(1000).sub(1000),
            );

            await expect(
              this.mock.doubleStringBytesCalldata(
                signature.v,
                signature.r,
                signature.s,
                value.expiry,
                this.params[0],
                this.params[1],
              ),
            ).to.be.revertedWith("AccessToken: has expired");
          });

          it("with already used token should revert", async function () {
            await expect(
              this.mock.doubleStringBytesCalldata(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
              ),
            ).to.not.be.reverted;

            await expect(
              this.mock.doubleStringBytesCalldata(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
              ),
            ).to.be.revertedWith("AccessToken: already used");
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
          beforeEach("construct token", async function () {
            this.params = ["some string", "0xaaaaaaaaaaaaaa"];

            const { value, signature } = await generateEAT(
              this.signers.admin,
              this.domain,
              this.mock.interface,
              "doubleStringBytesMemory",
              this.mock.address,
              this.signers.admin.address,
              this.params,
              BigNumber.from(Math.floor(new Date().getTime())),
            );

            this.value = value;
            this.signature = signature;
          });

          it("with correct values should succeed", async function () {
            expect(
              await this.mock.callStatic.doubleStringBytesMemory(
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
            const { value, signature } = await generateEAT(
              this.signers.admin,
              this.domain,
              this.mock.interface,
              "doubleStringBytesMemory",
              this.mock.address,
              this.signers.admin.address,
              this.params,
              BigNumber.from(Math.floor(new Date().getTime())).div(1000).sub(1000),
            );

            await expect(
              this.mock.doubleStringBytesMemory(
                signature.v,
                signature.r,
                signature.s,
                value.expiry,
                this.params[0],
                this.params[1],
              ),
            ).to.be.revertedWith("AccessToken: has expired");
          });

          it("with already used token should revert", async function () {
            await expect(
              this.mock.doubleStringBytesMemory(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
              ),
            ).to.not.be.reverted;

            await expect(
              this.mock.doubleStringBytesMemory(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
              ),
            ).to.be.revertedWith("AccessToken: already used");
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
          beforeEach("construct token", async function () {
            this.params = ["some string", "0xaaaaaaaaaaaaaa", this.signers.user0.address];

            const { value, signature } = await generateEAT(
              this.signers.admin,
              this.domain,
              this.mock.interface,
              "multipleStringBytesAddress",
              this.mock.address,
              this.signers.admin.address,
              this.params,
              BigNumber.from(Math.floor(new Date().getTime())),
            );

            this.value = value;
            this.signature = signature;
          });

          it("with correct values should succeed", async function () {
            expect(
              await this.mock.callStatic.multipleStringBytesAddress(
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
            const { value, signature } = await generateEAT(
              this.signers.admin,
              this.domain,
              this.mock.interface,
              "multipleStringBytesAddress",
              this.mock.address,
              this.signers.admin.address,
              this.params,
              BigNumber.from(Math.floor(new Date().getTime())).div(1000).sub(1000),
            );

            await expect(
              this.mock.multipleStringBytesAddress(
                signature.v,
                signature.r,
                signature.s,
                value.expiry,
                this.params[0],
                this.params[1],
                this.params[2],
              ),
            ).to.be.revertedWith("AccessToken: has expired");
          });

          it("with already used token should revert", async function () {
            await expect(
              this.mock.multipleStringBytesAddress(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
                this.params[2],
              ),
            ).to.not.be.reverted;

            await expect(
              this.mock.multipleStringBytesAddress(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
                this.params[2],
              ),
            ).to.be.revertedWith("AccessToken: already used");
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
          beforeEach("construct token", async function () {
            this.params = ["some string", "0xaaaaaaaaaaaaaa", this.signers.user0.address, 42];

            const { value, signature } = await generateEAT(
              this.signers.admin,
              this.domain,
              this.mock.interface,
              "multipleStringBytesAddressUint256",
              this.mock.address,
              this.signers.admin.address,
              this.params,
              BigNumber.from(Math.floor(new Date().getTime())),
            );

            this.value = value;
            this.signature = signature;
          });

          it("with correct values should succeed", async function () {
            expect(
              await this.mock.callStatic.multipleStringBytesAddressUint256(
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
            const { value, signature } = await generateEAT(
              this.signers.admin,
              this.domain,
              this.mock.interface,
              "multipleStringBytesAddressUint256",
              this.mock.address,
              this.signers.admin.address,
              this.params,
              BigNumber.from(Math.floor(new Date().getTime())).div(1000).sub(1000),
            );

            await expect(
              this.mock.multipleStringBytesAddressUint256(
                signature.v,
                signature.r,
                signature.s,
                value.expiry,
                this.params[0],
                this.params[1],
                this.params[2],
                this.params[3],
              ),
            ).to.be.revertedWith("AccessToken: has expired");
          });

          it("with already used token should revert", async function () {
            await expect(
              this.mock.multipleStringBytesAddressUint256(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
                this.params[2],
                this.params[3],
              ),
            ).to.not.be.reverted;

            await expect(
              this.mock.multipleStringBytesAddressUint256(
                this.signature.v,
                this.signature.r,
                this.signature.s,
                this.value.expiry,
                this.params[0],
                this.params[1],
                this.params[2],
                this.params[3],
              ),
            ).to.be.revertedWith("AccessToken: already used");
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
          beforeEach("construct token", async function () {
            this.params = ["some string", "0xaaaaaaaaaaaaaa", this.signers.user0.address, 42, "0xbbbbbbbbbbbb"];

            const { value, signature } = await generateEAT(
              this.signers.admin,
              this.domain,
              this.mock.interface,
              "multipleStringBytesAddressUint256Bytes",
              this.mock.address,
              this.signers.admin.address,
              this.params,
              BigNumber.from(Math.floor(new Date().getTime())),
            );

            this.value = value;
            this.signature = signature;
          });

          it("with correct values should succeed", async function () {
            expect(
              await this.mock.callStatic.multipleStringBytesAddressUint256Bytes(
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
            const { value, signature } = await generateEAT(
              this.signers.admin,
              this.domain,
              this.mock.interface,
              "multipleStringBytesAddressUint256Bytes",
              this.mock.address,
              this.signers.admin.address,
              this.params,
              BigNumber.from(Math.floor(new Date().getTime())).div(1000).sub(1000),
            );

            await expect(
              this.mock.multipleStringBytesAddressUint256Bytes(
                signature.v,
                signature.r,
                signature.s,
                value.expiry,
                this.params[0],
                this.params[1],
                this.params[2],
                this.params[3],
                this.params[4],
              ),
            ).to.be.revertedWith("AccessToken: has expired");
          });

          it("with already used token should revert", async function () {
            await expect(
              this.mock.multipleStringBytesAddressUint256Bytes(
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
            ).to.not.be.reverted;

            await expect(
              this.mock.multipleStringBytesAddressUint256Bytes(
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
            ).to.be.revertedWith("AccessToken: already used");
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
        beforeEach("construct token", async function () {
          const { value, signature } = await generateEAT(
            this.signers.admin,
            this.domain,
            this.mock.interface,
            "noParams",
            this.mock.address,
            this.signers.admin.address,
            [],
            BigNumber.from(Math.floor(new Date().getTime())),
          );
          this.value = value;
          this.signature = signature;
        });

        it("with correct values should succeed", async function () {
          expect(
            await this.mock.callStatic.noParams(
              this.signature.v,
              this.signature.r,
              this.signature.s,
              this.value.expiry,
            ),
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
          const { value, signature } = await generateEAT(
            this.signers.admin,
            this.domain,
            this.mock.interface,
            "noParams",
            this.mock.address,
            this.signers.admin.address,
            [],
            BigNumber.from(Math.floor(new Date().getTime())).div(1000).sub(1000),
          );

          await expect(
            this.mock.noParams(this.signature.v, this.signature.r, signature.s, value.expiry.sub(50)),
          ).to.be.revertedWith("AccessToken: has expired");
        });

        it("with incorrect expiry should revert", async function () {
          await expect(
            this.mock.noParams(this.signature.v, this.signature.r, this.signature.s, this.value.expiry.add(50)),
          ).to.be.revertedWith("AccessToken: verification failure");
        });

        it("with used EAT should revert", async function () {
          await expect(
            this.mock.noParams(this.signature.v, this.signature.r, this.signature.s, this.value.expiry),
          ).to.not.be.reverted;

          await expect(
            this.mock.noParams(this.signature.v, this.signature.r, this.signature.s, this.value.expiry),
          ).to.be.revertedWith("AccessToken: already used");
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
