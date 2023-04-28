import { ethers, waffle } from "hardhat";
import chai from "chai";
import { signAccessToken } from "../../src/utils/signAccessToken";
import { generateEAT } from "../helpers/utils";
import { splitSignature } from "@ethersproject/bytes";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Domain } from "../../src/messages";
import { Contract } from "ethers";

const { solidity } = waffle;
chai.use(solidity);
const { expect } = chai;
const { BigNumber } = ethers;

const shouldBehaveLikeAccessTokenConsumer = function () {
  describe("sign and verify", async () => {
    context("when calling function", async function () {
      context("with parameters", async function () {
        describe("address", async function () {
          it("full test suite", async function () {
            await performTestSuiteForFunction(
              "address",
              this.signers.admin,
              this.domain,
              this.mock,
              this.fakeMock,
              "singleAddress",
              this.mock.address,
              this.signers.admin.address,
              [this.signers.user0.address],
              [this.signers.user1],
            );
          });
        });

        describe("uint256", async function () {
          it("full test suite", async function () {
            await performTestSuiteForFunction(
              "uint256",
              this.signers.admin,
              this.domain,
              this.mock,
              this.fakeMock,
              "singleUint256",
              this.mock.address,
              this.signers.admin.address,
              [BigNumber.from(42)],
              [this.signers.user1],
            );
          });
        });

        describe("string calldata", async function () {
          it("full test suite", async function () {
            await performTestSuiteForFunction(
              "string calldata",
              this.signers.admin,
              this.domain,
              this.mock,
              this.fakeMock,
              "singleStringCalldata",
              this.mock.address,
              this.signers.admin.address,
              ["random string"],
              [this.signers.user1],
            );
          });
        });

        describe("string memory", async function () {
          it("full test suite", async function () {
            await performTestSuiteForFunction(
              "string memory",
              this.signers.admin,
              this.domain,
              this.mock,
              this.fakeMock,
              "singleStringMemory",
              this.mock.address,
              this.signers.admin.address,
              ["random string"],
              [this.signers.user1],
            );
          });
        });

        describe("byte", async function () {
          it("full test suite", async function () {
            await performTestSuiteForFunction(
              "byte",
              this.signers.admin,
              this.domain,
              this.mock,
              this.fakeMock,
              "singleByte",
              this.mock.address,
              this.signers.admin.address,
              ["0x42"],
              [this.signers.user1],
            );
          });
        });

        describe("bytes calldata", async function () {
          it("full test suite", async function () {
            await performTestSuiteForFunction(
              "bytes calldata",
              this.signers.admin,
              this.domain,
              this.mock,
              this.fakeMock,
              "singleBytesCalldata",
              this.mock.address,
              this.signers.admin.address,
              ["0xaaaaaaaaaaaaaaaa"],
              [this.signers.user1],
            );
          });
        });

        describe("bytes memory", async function () {
          it("full test suite", async function () {
            await performTestSuiteForFunction(
              "bytes memory",
              this.signers.admin,
              this.domain,
              this.mock,
              this.fakeMock,
              "singleBytesMemory",
              this.mock.address,
              this.signers.admin.address,
              ["0xaaaaaaaaaaaaaaaa"],
              [this.signers.user1],
            );
          });
        });

        describe("address, uint256", async function () {
          it("full test suite", async function () {
            await performTestSuiteForFunction(
              "address, uint256",
              this.signers.admin,
              this.domain,
              this.mock,
              this.fakeMock,
              "doubleAddressUint",
              this.mock.address,
              this.signers.admin.address,
              [this.signers.user0.address, 42],
              [this.signers.user1],
            );
          });
        });

        describe("uint256, string", async function () {
          it("full test suite", async function () {
            await performTestSuiteForFunction(
              "uint256, string",
              this.signers.admin,
              this.domain,
              this.mock,
              this.fakeMock,
              "doubleUint256String",
              this.mock.address,
              this.signers.admin.address,
              [42, "some string"],
              [this.signers.user1],
            );
          });
        });

        describe("string, bytes calldata", async function () {
          it("full test suite", async function () {
            await performTestSuiteForFunction(
              "string, bytes calldata",
              this.signers.admin,
              this.domain,
              this.mock,
              this.fakeMock,
              "doubleStringBytesCalldata",
              this.mock.address,
              this.signers.admin.address,
              ["some string", "0xaaaaaaaaaaaaaa"],
              [this.signers.user1],
            );
          });
        });

        describe("string, bytes memory", async function () {
          it("full test suite", async function () {
            await performTestSuiteForFunction(
              "string, bytes memory",
              this.signers.admin,
              this.domain,
              this.mock,
              this.fakeMock,
              "doubleStringBytesMemory",
              this.mock.address,
              this.signers.admin.address,
              ["some string", "0xaaaaaaaaaaaaaa"],
              [this.signers.user1],
            );
          });
        });

        describe("string, bytes calldata, address", async function () {
          it("full test suite", async function () {
            await performTestSuiteForFunction(
              "string, bytes calldata, address",
              this.signers.admin,
              this.domain,
              this.mock,
              this.fakeMock,
              "multipleStringBytesAddress",
              this.mock.address,
              this.signers.admin.address,
              ["some string", "0xaaaaaaaaaaaaaa", this.signers.user0.address],
              [this.signers.user1],
            );
          });
        });

        describe("string, bytes calldata, address, uint256", async function () {
          it("full test suite", async function () {
            await performTestSuiteForFunction(
              "string, bytes calldata, address, uint256",
              this.signers.admin,
              this.domain,
              this.mock,
              this.fakeMock,
              "multipleStringBytesAddressUint256",
              this.mock.address,
              this.signers.admin.address,
              ["some string", "0xaaaaaaaaaaaaaa", this.signers.user0.address, 42],
              [this.signers.user1],
            );
          });
        });

        describe("string, bytes calldata, address, uint256, bytes calldata", async function () {
          it("full test suite", async function () {
            await performTestSuiteForFunction(
              "string, bytes calldata, address, uint256, bytes calldata",
              this.signers.admin,
              this.domain,
              this.mock,
              this.fakeMock,
              "multipleStringBytesAddressUint256Bytes",
              this.mock.address,
              this.signers.admin.address,
              ["some string", "0xaaaaaaaaaaaaaa", this.signers.user0.address, 42, "0xbbbbbbbbbbbb"],
              [this.signers.user1],
            );
          });
        });
      });

      context("without parameters", async function () {
        it("full test suite", async function () {
          await performTestSuiteForFunction(
            "without parameters",
            this.signers.admin,
            this.domain,
            this.mock,
            this.fakeMock,
            "noParams",
            this.mock.address,
            this.signers.admin.address,
            [],
            [this.signers.user1],
          );
        });
      });
    });
  });
};

const performTestSuiteForFunction = async (
  testName: string,
  EATSigner: SignerWithAddress,
  eip712Domain: Domain,
  contract: Contract,
  fakeMock: Contract,
  functionName: string,
  targetAddress: string,
  callerAddress: string,
  parameters: any[],
  extraAccounts: SignerWithAddress[],
) => {
  describe(testName, async function () {
    beforeEach("construct token", async function () {
      const { token, signature } = await generateEAT(
        EATSigner,
        eip712Domain,
        contract.interface,
        functionName,
        targetAddress,
        callerAddress,
        parameters,
        BigNumber.from(Math.floor(new Date().getTime())),
      );
      this.token = token;
      this.signature = signature;
    });

    it("with correct values should succeed", async function () {
      expect(
        await contract.callStatic[functionName](
          this.signature.v,
          this.signature.r,
          this.signature.s,
          this.token.expiry,
          ...parameters,
        ),
      ).to.be.true;
    });

    it("with incorrect caller should revert", async function () {
      await expect(
        contract
          .connect(extraAccounts[0])
          [functionName](this.signature.v, this.signature.r, this.signature.s, this.token.expiry, ...parameters),
      ).to.be.revertedWith("AccessToken: VF");
    });

    it("with expired token should revert", async function () {
      const { token, signature } = await generateEAT(
        EATSigner,
        eip712Domain,
        contract.interface,
        functionName,
        targetAddress,
        callerAddress,
        parameters,
        BigNumber.from(Math.floor(new Date().getTime())).div(1000).sub(1000),
      );

      await expect(
        contract[functionName](this.signature.v, this.signature.r, signature.s, token.expiry.sub(50), ...parameters),
      ).to.be.revertedWith("AccessToken: HE");
    });

    it("with incorrect expiry should revert", async function () {
      await expect(
        contract[functionName](
          this.signature.v,
          this.signature.r,
          this.signature.s,
          this.token.expiry.add(50),
          ...parameters,
        ),
      ).to.be.revertedWith("AccessToken: VF");
    });

    it("with used EAT should revert", async function () {
      await expect(
        contract[functionName](this.signature.v, this.signature.r, this.signature.s, this.token.expiry, ...parameters),
      ).to.not.be.reverted;

      await expect(
        contract[functionName](this.signature.v, this.signature.r, this.signature.s, this.token.expiry, ...parameters),
      ).to.be.revertedWith("AccessToken: AU");
    });

    it("with incorrect signer should revert", async function () {
      const signature = splitSignature(await signAccessToken(extraAccounts[0], this.domain, this.token));

      await expect(
        contract[functionName](signature.v, signature.r, signature.s, this.token.expiry, ...parameters),
      ).to.be.revertedWith("AccessToken: VF");
    });

    it("with incorrect function signature should revert", async function () {
      const signature = splitSignature(
        await signAccessToken(EATSigner, this.domain, {
          ...this.token,
          functionCall: {
            ...this.token.functionCall,
            functionSignature: "0xdeadbeef",
          },
        }),
      );

      await expect(
        contract[functionName](signature.v, signature.r, signature.s, this.token.expiry, ...parameters),
      ).to.be.revertedWith("AccessToken: VF");
    });

    it("with incorrect target contract should revert", async function () {
      await expect(
        fakeMock[functionName](this.signature.v, this.signature.r, this.signature.s, this.token.expiry, ...parameters),
      ).to.be.revertedWith("AccessToken: VF");
    });
  });
};

export { shouldBehaveLikeAccessTokenConsumer };
